import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Draft, DraftSnapshot } from '../types';
import type { Database } from '../types/database.types';
import { telemetryService } from './telemetryService';
import { calculateSnapshotHash } from '../utils/crypto';


type DbDraft = Database['public']['Tables']['drafts']['Row'];

export class DraftService {
  /**
   * Initialize a new drafting session
   */
  static async getEmergencyClient(): Promise<SupabaseClient<Database> | null> {
      try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
          
          if (!supabaseUrl || !supabaseAnonKey) {
             console.warn('[DraftService] Missing Env Vars for Emergency Client');
             return null;
          }

          // Extract project ref
          const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
          if (!projectRef) {
             console.warn('[DraftService] Could not parse Project Ref from URL');
             return null;
          }

          const tokenKey = `sb-${projectRef}-auth-token`;
          const sessionStr = localStorage.getItem(tokenKey);
          if (!sessionStr) {
             console.warn('[DraftService] No session found in localStorage');
             return null;
          }

          const session = JSON.parse(sessionStr);
          const accessToken = session.access_token;
          if (!accessToken) {
             console.warn('[DraftService] No access token in session');
             return null;
          }
          
          console.log('[DraftService] Initializing Emergency Client (Bypassing Global Auth Lock)...');
          // Create client that trusts the token blindly (Nuclear Option)
          const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
              auth: {
                  persistSession: false,
                  autoRefreshToken: false,
                  detectSessionInUrl: false
              },
              global: {
                  headers: {
                      Authorization: `Bearer ${accessToken}`
                  }
              }
          });
          return client;
      } catch (e) {
          console.warn('[DraftService] Failed to create emergency client:', e);
          return null;
      }
  }

  /**
   * Initialize a new drafting session
   */
  static async createDraft(userId: string, title: string = 'Untitled Draft', client: SupabaseClient<Database> = supabase): Promise<Draft | null> {
    try {
      console.log('[DraftService] createDraft starting for user:', userId);
      console.log('[DraftService] createDraft starting for user:', userId);
      
      console.log('[DraftService] Sending INSERT request to Supabase...');
      const { data, error } = await client
        .from('drafts')
        .insert({
          user_id: userId,
          title,
          current_content: '',
        })
        .select()
        .single();
      console.log('[DraftService] Supabase INSERT response received (Data: ' + (!!data) + ', Error: ' + (error?.message || 'none') + ')');
      
      if (error) {
        console.error('[DraftService] INSERT error:', error);
        throw error;
      }
      if (!data) {
        console.warn('[DraftService] INSERT returned no data');
        return null;
      }

      console.log('[DraftService] Draft created successfully:', data.id);
      
      // Start telemetry session
      telemetryService.startSession();
      
      return DraftService.mapDraft(data);
    } catch (error) {
      console.warn('[DraftService] Create error:', error);
      return null;
    }
  }

  /**
   * Update draft content and create snapshot with forensic data
   */
  static async updateDraft(
    draftId: string, 
    content: string, 
    previousContent: string,
    isPaste: boolean = false,
    userId?: string, // SOVEREIGN BYPASS: Pass ID directly to avoid Auth Client deadlocks
    onDraftPromoted?: (newDraft: Draft) => void, // Callback when local draft is promoted to server
    client: SupabaseClient<Database> = supabase
  ): Promise<Draft | null> {
    
    // SOVEREIGNTY SYNC: Handle promotion of local drafts to server
    if (draftId.startsWith('local-')) {
        console.log('[DraftService] Promoting local draft to server...');
        // alert('Admin Debug: Promoting Local Draft...'); // Uncomment if console is hidden

        try {
            let resolvedUserId = userId;

            // 1. Resolve User ID (If not provided)
            if (!resolvedUserId) {
                // SOFT TIMEOUT: If getUser (network) hangs, resolve null to trigger fallback
                const softTimeoutPromise = new Promise<{ data: { user: { id: string } | null } | null }>((resolve) => 
                    setTimeout(() => {
                        console.warn('[DraftService] getUser network check timed out (3s). Triggering fallback...');
                        resolve({ data: { user: null } }); 
                    }, 3000)
                );
                
                // Try sync check first (Raced against soft timeout)
                console.log('[DraftService] Resolving user identity...');
                
                const { data: authData } = await Promise.race([
                    supabase.auth.getUser(),
                    softTimeoutPromise
                ]) as { data: { user: { id: string } | null } | null };

                resolvedUserId = authData?.user?.id;
                
                if (!resolvedUserId) {
                    console.warn('[DraftService] No user in getUser(), using getSession (Local Fallback)...');
                    const { data } = await supabase.auth.getSession();
                    resolvedUserId = data?.session?.user?.id;
                }
            } else {
                 console.log('[DraftService] Using provided userId (Bypassing Auth Client Check)');
            }

            if (!resolvedUserId) {
                console.warn('[DraftService] Promotion failed: No authenticated user found.');
                alert('Error: You must be logged in to attest. Please cache-refresh or log in again.');
                return null;
            }
            console.log('[DraftService] User ID resolved:', resolvedUserId);

            // 2. Create real draft
            console.log('[DraftService] Creating new server draft (Emergency Protocol)...');
            
            // Try to get emergency client to break deadlock
            const emergencyClient = await DraftService.getEmergencyClient() || supabase;
            
            const newDraft = await DraftService.createDraft(resolvedUserId, 'Recovered Draft', emergencyClient);
            
            if (!newDraft) {
                console.warn('[DraftService] Promotion failed: createDraft returned null. Check RLS or Database Connection.');
                alert('Connection Error: Unable to create server draft. Please check your internet.');
                return null;
            }
            console.log('[DraftService] Server draft created:', newDraft.id);
            
            // Immediately notify caller so they can update React state
            // This prevents race conditions where handleAttest sees stale local- ID
            if (onDraftPromoted) {
                console.log('[DraftService] Notifying caller of promotion...');
                onDraftPromoted(newDraft);
            }
            
            // 3. Update content (Snapshot)
            console.log('[DraftService] Syncing content to new draft...');
            // Pass the resolvedUserId AND emergencyClient to recursive call (no callback for recursive call)
            return DraftService.updateDraft(newDraft.id, content, '', false, resolvedUserId, undefined, emergencyClient);

        } catch (err) {
            console.warn('[DraftService] Promotion Exception:', err);
            // Alert removed to prevent scaring user if it's handled by EditorPage, 
            // but kept helpful message if needed. EditorPage catch block handles the main alert.
            return null;
        }
    }

    const timestamp = new Date().toISOString();
    
    // 1. Calculate Diff Metrics
    const charDelta = content.length - previousContent.length;
    
    // Threshold config: Snapshot on significant events
    // - Paste detected
    // - > 50 chars typed (batching) or < -10 chars deleted
    // - Every 60 seconds (handled by caller logic typically, but here we just check content delta)
    const isSignificant = Math.abs(charDelta) > 10 || isPaste;
    
    if (isSignificant) {
      try {
        // A. Get previous snapshot hash (Chain of Custody)
        // NOTE: Use .maybeSingle() instead of .single() to handle new drafts with no snapshots
        // .single() throws PGRST116 (406) when 0 rows are returned
        const { data: prevSnap, error: prevSnapError } = await client
          .from('draft_snapshots')
          .select('integrity_hash')
          .eq('draft_id', draftId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (prevSnapError) {
          console.warn('[DraftService] Failed to fetch previous snapshot:', prevSnapError);
        }

        const prevHash = prevSnap?.integrity_hash || 'GENESIS';

        // C. Get Telemetry Block - RED TAPE ENFORCEMENT
        const telemetry = telemetryService.getSessionMetrics();
        
        let shouldSnapshot = true;

        // Constraint A: No Telemetry = No Snapshot (Forensic Gap)
        if (!telemetry || (telemetry.keyCount === 0 && !isPaste && Math.abs(charDelta) > 0)) {
            console.warn('[DraftService] Red-Tape Protocol: Skipping Snapshot. No telemetry data for active change.');
            shouldSnapshot = false;
        }

        if (shouldSnapshot) {
            // B. Calculate new integrity hash
            const integrityHash = await calculateSnapshotHash(content, timestamp, prevHash, telemetry);

            // D. Insert Snapshot
            await client.from('draft_snapshots').insert({
              draft_id: draftId,
              timestamp,
              content_diff: content, 
              char_count_delta: charDelta,
              paste_event_detected: isPaste,
              telemetry_data: telemetry ? (telemetry as unknown as Database['public']['Tables']['draft_snapshots']['Insert']['telemetry_data']) : null,
              integrity_hash: integrityHash
            });
        }

      } catch (e) {
        console.warn('[DraftService] Snapshot save failed:', e);
      }
    }

    // 2. Update Current Draft State
    try {
      const { data, error } = await client
        .from('drafts')
        .update({
          current_content: content,
          last_updated: timestamp
        })
        .eq('id', draftId)
        .select()
        .single();

      if (error) throw error;
      return DraftService.mapDraft(data);
    } catch (error) {
      console.error('[DraftService] Update error:', error);
      return null;
    }
  }

  /**
   * Retrieve draft by ID
   */
  static async getDraft(draftId: string): Promise<Draft | null> {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('id', draftId)
      .single();

    if (error || !data) return null;
    return DraftService.mapDraft(data);
  }

  /**
   * Update just the title of a draft
   */
  static async updateTitle(draftId: string, newTitle: string): Promise<void> {
    await supabase
      .from('drafts')
      .update({ title: newTitle, last_updated: new Date().toISOString() })
      .eq('id', draftId);
  }

  /**
   * Retrieve snapshots for a draft
   */
  static async getSnapshots(draftId: string, client: SupabaseClient<Database> = supabase): Promise<DraftSnapshot[]> {
    const { data, error } = await client
      .from('draft_snapshots')
      .select('*')
      .eq('draft_id', draftId)
      .order('timestamp', { ascending: false }); // Newest first

    if (error || !data) return [];
    
    return data.map(row => ({
      id: row.id,
      draftId: row.draft_id,
      timestamp: row.timestamp,
      contentDiff: row.content_diff,
      charCountDelta: row.char_count_delta ?? 0,
      pasteEventDetected: row.paste_event_detected ?? false
    }));
  }

  /**
   * Refined Score Calculation w/ "Forgiving Reset"
   * If draft is cleared (length -> 0), history resets.
   */
  static computeScore(snapshots: { charCountDelta: number, pasteEventDetected: boolean }[]): number {
    let totalCharsAdded = 0;
    let pasteChars = 0;
    let runningLength = 0;

    // Process chronologically (Oldest -> Newest)
    const chronological = [...snapshots].reverse();

    chronological.forEach(s => {
      runningLength += s.charCountDelta;
      if (runningLength < 0) runningLength = 0; // Safety floor

      if (s.charCountDelta > 0) {
        totalCharsAdded += s.charCountDelta;
        if (s.pasteEventDetected || s.charCountDelta > 500) {
          pasteChars += s.charCountDelta;
        }
      }

      // RESET LOGIC: If document is effectively cleared, reset stats
      if (runningLength < 10) { 
        totalCharsAdded = 0;
        pasteChars = 0;
      }
    });

    if (totalCharsAdded === 0) return 100;

    const organicRatio = (totalCharsAdded - pasteChars) / totalCharsAdded;
    return Math.round(organicRatio * 100);
  }

  /**
   * Compute "Sovereignty Score" based on telemetry and history
   */
  static async calculateSovereigntyScore(draftId: string, client: SupabaseClient<Database> = supabase): Promise<number> {
    const { data: snapshots } = await client
      .from('draft_snapshots')
      .select('*')
      .eq('draft_id', draftId)
      .order('timestamp', { ascending: false }); 

    if (!snapshots || snapshots.length === 0) return 100;

    // Map to simple structure for computeScore
    const mappedSnaps = snapshots.map(s => ({
      charCountDelta: s.char_count_delta ?? 0,
      pasteEventDetected: s.paste_event_detected ?? false
    }));

    return DraftService.computeScore(mappedSnaps);
  }

  // Helper: map DB row to frontend type
  private static mapDraft(row: DbDraft): Draft {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title ?? 'Untitled Draft',
      currentContent: row.current_content ?? '',
      lastUpdated: row.last_updated,
      createdAt: row.created_at
    };
  }
}

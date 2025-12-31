import { supabase } from '../lib/supabase';
import type { Draft, DraftSnapshot } from '../types';
import type { Database } from '../types/database.types';
import { telemetryService } from './telemetryService';

type DbDraft = Database['public']['Tables']['drafts']['Row'];

export class DraftService {
  /**
   * Initialize a new drafting session
   */
  static async createDraft(userId: string, title: string = 'Untitled Draft'): Promise<Draft | null> {
    try {
      const { data, error } = await supabase
        .from('drafts')
        .insert({
          user_id: userId,
          title,
          current_content: '',
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

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
    isPaste: boolean = false
  ): Promise<Draft | null> {
    
    // SOVEREIGNTY SYNC: Handle promotion of local drafts to server
    if (draftId.startsWith('local-')) {
        console.log('[DraftService] Promoting local draft to server...');
        // alert('Admin Debug: Promoting Local Draft...'); // Uncomment if console is hidden

        try {
            // 1. Get User ID (With Soft Timeout Fallback)
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

            let userId = authData?.user?.id;
            
            if (!userId) {
                console.warn('[DraftService] No user in getUser(), using getSession (Local Fallback)...');
                const { data } = await supabase.auth.getSession();
                userId = data?.session?.user?.id;
            }

            if (!userId) {
                console.warn('[DraftService] Promotion failed: No authenticated user found.');
                alert('Error: You must be logged in to attest. Please cache-refresh or log in again.');
                return null;
            }
            console.log('[DraftService] User ID resolved:', userId);

            // 2. Create real draft
            console.log('[DraftService] Creating new server draft...');
            const newDraft = await DraftService.createDraft(userId, 'Recovered Draft');
            
            if (!newDraft) {
                console.warn('[DraftService] Promotion failed: createDraft returned null. Check RLS or Database Connection.');
                alert('Connection Error: Unable to create server draft. Please check your internet.');
                return null;
            }
            console.log('[DraftService] Server draft created:', newDraft.id);
            
            // 3. Update content (Snapshot)
            console.log('[DraftService] Syncing content to new draft...');
            return DraftService.updateDraft(newDraft.id, content, '', false);

        } catch (err) {
            console.warn('[DraftService] Promotion Exception:', err);
            alert('Critical Error during promotion: ' + (err instanceof Error ? err.message : String(err)));
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
        const { data: prevSnap } = await supabase
          .from('draft_snapshots')
          .select('integrity_hash')
          .eq('draft_id', draftId)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        const prevHash = prevSnap?.integrity_hash || 'GENESIS';

        // B. Calculate new integrity hash
        // Hash(Content + PrevHash + Timestamp)
        const hashInput = `${content}${prevHash}${timestamp}`;
        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(hashInput));
        const integrityHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

        // C. Get Telemetry Block
        const telemetry = telemetryService.getSessionMetrics();

        // D. Insert Snapshot
        await supabase.from('draft_snapshots').insert({
          draft_id: draftId,
          timestamp,
          content_diff: content, // Storing full content for now to enable hash verification
          char_count_delta: charDelta,
          paste_event_detected: isPaste,
          telemetry_data: telemetry ? (telemetry as unknown as Database['public']['Tables']['draft_snapshots']['Insert']['telemetry_data']) : null,
          integrity_hash: integrityHash
        });

      } catch (e) {
        console.warn('[DraftService] Snapshot save failed:', e);
      }
    }

    // 2. Update Current Draft State
    try {
      const { data, error } = await supabase
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
  static async getSnapshots(draftId: string): Promise<DraftSnapshot[]> {
    const { data, error } = await supabase
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
  static async calculateSovereigntyScore(draftId: string): Promise<number> {
    const { data: snapshots } = await supabase
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

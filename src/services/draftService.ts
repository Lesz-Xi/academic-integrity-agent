
import { supabase } from '../lib/supabase';
import type { Draft, DraftSnapshot } from '../types';
import type { Database } from '../types/database.types';

type DbDraft = Database['public']['Tables']['drafts']['Row'];

export class DraftService {
  /**
   * Initialize a new draft
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

      return DraftService.mapDraft(data);
    } catch (error) {
      console.error('[DraftService] Create error:', error);
      return null;
    }
  }

  /**
   * Update draft content and create snapshot if significant change detected
   */
  static async updateDraft(
    draftId: string, 
    content: string, 
    previousContent: string,
    isPaste: boolean = false
  ): Promise<Draft | null> {
    const timestamp = new Date().toISOString();
    
    // 1. Calculate Diff Metrics
    const charDelta = content.length - previousContent.length;
    const diffThreshold = 0; // Capture all debounced edits for accurate score
    
    // 2. Save Snapshot if threshold met OR explicit paste event
    if (Math.abs(charDelta) > diffThreshold || isPaste) {
      try {
        await supabase.from('draft_snapshots').insert({
          draft_id: draftId,
          timestamp,
          content_diff: null, // Optimization: Don't store full text/diff every time yet, just metadata
          char_count_delta: charDelta,
          paste_event_detected: isPaste
        });
      } catch (e) {
        console.warn('[DraftService] Snapshot save failed:', e);
      }
    }

    // 3. Update Current Draft State
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
      charCountDelta: row.char_count_delta,
      pasteEventDetected: row.paste_event_detected
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
    // We assume input snapshots might be Newest->Oldest if coming from getSnapshots(), so we reverse if needed.
    // Actually getSnapshots returns Newest First. computeScore expects Chronological to track runningLength.
    // So we will copy and reverse.
    
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
      // This allows a user to "undo" a paste by deleting it and starting fresh.
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
   * Compute "Sovereignty Score" (0-100)
   */
  static async calculateSovereigntyScore(draftId: string): Promise<number> {
    const { data: snapshots } = await supabase
      .from('draft_snapshots')
      .select('*')
      .eq('draft_id', draftId)
      .order('timestamp', { ascending: false }); // Newest first

    if (!snapshots || snapshots.length === 0) return 100;

    // Map to simple structure for computeScore
    const mappedSnaps = snapshots.map(s => ({
      charCountDelta: s.char_count_delta,
      pasteEventDetected: s.paste_event_detected
    }));

    return DraftService.computeScore(mappedSnaps);
  }

  private static mapDraft(row: DbDraft): Draft {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      currentContent: row.current_content,
      lastUpdated: row.last_updated,
      createdAt: row.created_at
    };
  }
}

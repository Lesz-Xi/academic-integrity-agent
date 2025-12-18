import { supabase } from '../lib/supabase'
import type { HistoryItem, DetectionMetrics, Mode } from '../types'
import type { Json } from '../types/database.types'

export class GenerationService {
  /**
   * Fetch user's generation history with pagination
   */
  static async getHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<HistoryItem[]> {
    console.log('[GenerationService] getHistory called for user:', userId)
    
    try {
      const { data, error } = await supabase
        .from('generations')
        .select('id, user_id, mode, input, output, metrics, created_at')
        .eq('user_id', userId)
        .is('deleted_at', null)  // Only show non-deleted items
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error('[GenerationService] Supabase query error:', error)
        console.error('[GenerationService] Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        throw error
      }

      console.log('[GenerationService] Query successful, rows:', data?.length ?? 0)
      if (!data) return []

      return data.map((gen: any) => ({
        id: gen.id,
        mode: gen.mode as Mode,
        input: gen.input,
        output: gen.output,
        metrics: gen.metrics as unknown as DetectionMetrics,
        timestamp: new Date(gen.created_at).getTime(),
      }))
    } catch (error) {
      console.error('[GenerationService] GetHistory error:', error)
      throw error
    }
  }

  /**
   * Create new generation record
   */
  static async createGeneration(
    userId: string,
    item: Omit<HistoryItem, 'id' | 'timestamp'>
  ): Promise<HistoryItem> {
    try {
      const { data, error } = await supabase
        .from('generations')
        .insert({
          user_id: userId,
          mode: item.mode,
          input: item.input,
          output: item.output,
          metrics: item.metrics as unknown as Json,
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase insert error:', error)
        throw error
      }

      if (!data) throw new Error('No data returned from insert')

      return {
        id: data.id,
        mode: data.mode as Mode,
        input: data.input,
        output: data.output,
        metrics: data.metrics as unknown as DetectionMetrics,
        timestamp: new Date(data.created_at).getTime(),
      }
    } catch (error) {
      console.error('CreateGeneration error:', error)
      throw error
    }
  }

  /**
   * Soft delete generation by ID (sets deleted_at timestamp)
   * This preserves the record for usage counting but hides it from history
   */
  static async deleteGeneration(id: string, userId: string): Promise<void> {
    console.log('[GenerationService] Soft deleting generation:', { id, userId });
    
    const { data, error } = await supabase
      .from('generations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    console.log('[GenerationService] Soft delete result:', { data, error });

    if (error) {
      console.error('[GenerationService] Soft delete error:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('[GenerationService] No rows updated - check if record exists and RLS policies allow update');
    } else {
      console.log('[GenerationService] Successfully soft deleted:', data[0]?.id);
    }
  }

  /**
   * Soft delete all generations for a user
   * This preserves records for usage counting but hides them from history
   */
  static async clearHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('generations')
      .update({ deleted_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('deleted_at', null)  // Only soft-delete items not already deleted

    if (error) throw error
  }

  /**
   * Get total generations count for the current month
   */
  static async getMonthlyUsage(userId: string): Promise<number> {
    const now = new Date();
    // Get first day of current month in UTC ISO string
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString();

    console.log('[GenerationService] Checking monthly usage since:', startOfMonth);

    try {
      // Create a timeout promise - increased to 10s
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Usage check timed out')), 15000); // Increased to 15s
      });

      // Execute query with timeout
      const { count, error } = await Promise.race([
        supabase
          .from('generations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', startOfMonth),
        timeoutPromise
      ]);

      if (error) {
        console.error('[GenerationService] Failed to get usage count:', error);
        throw error;
      }

      console.log('[GenerationService] Monthly usage count:', count);
      return count || 0;
    } catch (error) {
      console.error('[GenerationService] Usage check error (failing closed):', error);
      // Fail closed - if we can't verify usage, assume limit reached for security
      throw error;
    }
  }
}

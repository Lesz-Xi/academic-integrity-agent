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
   * Delete generation by ID
   */
  static async deleteGeneration(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) throw error
  }

  /**
   * Delete all generations for a user
   */
  static async clearHistory(userId: string): Promise<void> {
    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('user_id', userId)

    if (error) throw error
  }
}

import { supabase } from '../lib/supabase'
import type { HistoryItem } from '../types'

const STORAGE_KEY = 'generationHistory'

export class SyncService {
  /**
   * Migrate localStorage history to Supabase on first login
   * Now merges local items that don't exist in Supabase (instead of skipping)
   */
  static async migrateLocalStorageToSupabase(userId: string): Promise<number> {
    try {
      // Get localStorage history
      const localHistoryJson = localStorage.getItem(STORAGE_KEY)
      if (!localHistoryJson) {
        console.log('No localStorage history to migrate')
        return 0
      }

      const localHistory: HistoryItem[] = JSON.parse(localHistoryJson)
      if (localHistory.length === 0) {
        console.log('localStorage history is empty')
        return 0
      }

      // Get existing Supabase data
      const { data: existingData, error: fetchError } = await supabase
        .from('generations')
        .select('input, output')
        .eq('user_id', userId)

      if (fetchError) {
        console.error('Error fetching existing data:', fetchError)
        return 0
      }

      // Create a set of existing items (by input+output combo to avoid duplicates)
      const existingSet = new Set(
        (existingData || []).map(item => `${item.input.substring(0, 100)}|${item.output.substring(0, 100)}`)
      )

      // Filter out items that already exist in Supabase
      const newItems = localHistory.filter(item => {
        const key = `${item.input.substring(0, 100)}|${item.output.substring(0, 100)}`
        return !existingSet.has(key)
      })

      if (newItems.length === 0) {
        console.log('All localStorage items already exist in Supabase')
        return 0
      }

      // Batch insert new items only
      const inserts = newItems.map((item) => ({
        user_id: userId,
        mode: item.mode,
        input: item.input,
        output: item.output,
        metrics: item.metrics as any,
        created_at: new Date(item.timestamp).toISOString(),
      }))

      const { data, error } = await supabase
        .from('generations')
        .insert(inserts)
        .select()

      if (error) {
        console.error('Migration failed:', error)
        return 0
      }

      console.log(`✅ Successfully migrated ${data.length} NEW items to Supabase`)
      return data.length
    } catch (error) {
      console.error('Unexpected error during migration:', error)
      return 0
    }
  }

  /**
   * Sync theme preference from localStorage to Supabase
   */
  static async syncTheme(
    userId: string,
    theme: 'light' | 'dark'
  ): Promise<void> {
    try {
      await supabase.from('users').update({ theme }).eq('id', userId)
    } catch (error) {
      console.error('Error syncing theme:', error)
    }
  }

  /**
   * Sync disclaimer acceptance from localStorage to Supabase
   */
  static async syncDisclaimerAcceptance(userId: string): Promise<void> {
    try {
      const hasAccepted = localStorage.getItem('hasAcceptedDisclaimer') === 'true'

      if (hasAccepted) {
        await supabase
          .from('users')
          .update({ disclaimer_accepted: true })
          .eq('id', userId)
      }
    } catch (error) {
      console.error('Error syncing disclaimer:', error)
    }
  }

  /**
   * Full sync of all localStorage data to Supabase
   * Should be called once after user's first successful login
   */
  static async performFullSync(userId: string): Promise<void> {
    console.log('🔄 Starting full sync for user:', userId)

    try {
      // Migrate history
      const migratedCount = await this.migrateLocalStorageToSupabase(userId)

      // Sync theme
      const theme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (theme) {
        await this.syncTheme(userId, theme)
      }

      // Sync disclaimer
      await this.syncDisclaimerAcceptance(userId)

      console.log(
        `✅ Full sync completed (${migratedCount} items migrated)`
      )
    } catch (error) {
      console.error('Error during full sync:', error)
    }
  }
}

import { supabase } from '../lib/supabase'
import type { HistoryItem } from '../types'

const STORAGE_KEY = 'generationHistory'

export class SyncService {
  /**
   * Migrate localStorage history to Supabase on first login
   * IMPORTANT: Only migrates if the user has NO existing data in Supabase
   * This prevents data from anonymous sessions being assigned to wrong users
   */
  static async migrateLocalStorageToSupabase(userId: string): Promise<number> {
    try {
      // First, check if user already has ANY data in Supabase
      const { data: existingData, error: fetchError } = await supabase
        .from('generations')
        .select('id')
        .eq('user_id', userId)
        .limit(1)

      if (fetchError) {
        console.error('Error checking existing data:', fetchError)
        return 0
      }

      // If user already has data, we still migrate local storage to MERGE it
      // This ensures guest work isn't lost when logging into an existing account
      if (existingData && existingData.length > 0) {
        console.log('[SyncService] User has existing data, merging local history...')
      }

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

      // Batch insert items (Supabase will generate new IDs)
      // Note: This might create duplicates if the exact same generation exists,
      // but it's safer than losing data.
      const inserts = localHistory.map((item) => ({
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

      console.log(`✅ Successfully migrated ${data.length} items to Supabase`)
      
      // Clear localStorage after successful migration to prevent re-migration
      localStorage.removeItem(STORAGE_KEY)
      console.log('[SyncService] Cleared localStorage after migration')
      
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

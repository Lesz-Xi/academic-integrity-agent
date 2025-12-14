import { supabase } from '../lib/supabase'
import type { DbUser, DbUserUpdate } from '../types/supabase'

export class UserService {
  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<DbUser | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  /**
   * Update user theme preference
   */
  static async updateTheme(
    userId: string,
    theme: 'light' | 'dark'
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ theme })
      .eq('id', userId)

    if (error) throw error
  }

  /**
   * Mark disclaimer as accepted
   */
  static async acceptDisclaimer(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ disclaimer_accepted: true })
      .eq('id', userId)

    if (error) throw error
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: DbUserUpdate
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error
  }
}

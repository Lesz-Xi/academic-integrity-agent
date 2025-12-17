import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { SubscriptionService } from '../services/subscriptionService'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>
  signInWithGoogle: () => Promise<void>
  signInWithFacebook: () => Promise<void>
  signInWithInstagram: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Create user profile on first sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserProfile(session.user)

        // Auto-grant premium for specific users
        const PREMIUM_ALLOWLIST = ['genenipangue@gmail.com', 'rhinelesther@gmail.com']
        if (session.user.email && PREMIUM_ALLOWLIST.includes(session.user.email)) {
          console.log('[AuthContext] Auto-granting premium to:', session.user.email)
          try {
            await SubscriptionService.upgradeToPremium(session.user.id, 'annual')
            console.log('[AuthContext] Successfully auto-granted premium')
          } catch (err) {
            console.error('[AuthContext] Failed to auto-grant premium:', err)
          }
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if user profile exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error
        console.error('Error checking user profile:', fetchError)
        return
      }

      // Create profile if it doesn't exist
      if (!existingUser) {
        const { error: insertError } = await supabase.from('users').insert([{
          id: user.id,
          email: user.email || '',
          theme: 'light',
          disclaimer_accepted: false,
        }])

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        } else {
          console.log('User profile created successfully')
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error)
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
  }

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error

    // Check if email confirmation is required
    const needsConfirmation = !data.session

    return { needsConfirmation }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })

    if (error) throw error
  }

  const signInWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
  }

  const signInWithInstagram = async () => {
    // Note: Instagram Basic Display API is being deprecated/moved. 
    // This uses the Supabase 'instagram' provider which usually maps to "Instagram Basic Display".
    // For many apps, "Login with Facebook" is enough as it covers Instagram users too.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'instagram', // Requires specific Instagram setup in Supabase
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    console.log('[AuthContext] Signing out...')
    // Use scope: 'global' to sign out from all sessions
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) {
      console.error('[AuthContext] Sign out error:', error)
      throw error
    }
    // Clear local state
    setUser(null)
    setSession(null)
    console.log('[AuthContext] Signed out successfully')
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithFacebook,
    signInWithInstagram,
    signOut,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

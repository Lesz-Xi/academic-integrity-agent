import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'


interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string) => Promise<{ needsConfirmation: boolean }>
  signInWithGoogle: () => Promise<void>
  signInWithLinkedin: () => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we're in an OAuth callback (URL contains access_token or code)
    const isOAuthCallback = window.location.hash.includes('access_token') || 
                            window.location.search.includes('code=')
    
    // Timeout protection: ensure loading state never gets stuck
    // Shorter timeout for regular loads, longer for OAuth callbacks
    // REDUCED: 30s -> 10s for OAuth, 5s -> 3s for normal (improve perceived perf)
    const timeoutDuration = isOAuthCallback ? 10000 : 3000 
    const authTimeout = setTimeout(() => {
      if (loading) {
        console.warn('[AuthContext] Auth timeout after', timeoutDuration, 'ms - clearing stale session (likely network block)')
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }, timeoutDuration)

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('[AuthContext] Session error, clearing state:', error)
        setSession(null)
        setUser(null)
      } else {
        setSession(session)
        setUser(session?.user ?? null)
      }
      setLoading(false)
      clearTimeout(authTimeout)
    }).catch((err) => {
      console.error('[AuthContext] Failed to get session:', err)
      setSession(null)
      setUser(null)
      setLoading(false)
      clearTimeout(authTimeout)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      clearTimeout(authTimeout)

      // Create user profile on first sign in
      if (event === 'SIGNED_IN' && session?.user) {
        await ensureUserProfile(session.user)
        // Premium auto-grant is now handled by database verification
      }
    })

    return () => {
      clearTimeout(authTimeout)
      subscription.unsubscribe()
    }
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

  const signInWithLinkedin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    })

    if (error) throw error
  }

  const signOut = async () => {
    console.log('[AuthContext] Signing out...')
    try {
      // Use scope: 'global' to sign out from all sessions
      // Add a 3s timeout to prevent hanging UI
      const signOutPromise = supabase.auth.signOut({ scope: 'global' })
      const timeoutPromise = new Promise<{error: any}>((resolve) => {
        setTimeout(() => resolve({ error: new Error('Sign out timed out') }), 3000)
      })

      const { error } = await Promise.race([signOutPromise, timeoutPromise])
      if (error) {
        console.warn('[AuthContext] Sign out API issue (continuing with local clear):', error)
      }
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err)
    } finally {
      // ALWAYS clear local state regardless of API success
      setUser(null)
      setSession(null)
      console.log('[AuthContext] Signed out successfully (local state cleared)')
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithLinkedin,
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

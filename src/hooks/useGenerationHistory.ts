import { useState, useEffect, useCallback, useRef } from 'react'
import type { HistoryItem, Mode } from '../types'
import { GenerationService } from '../services/generationService'
import { SyncService } from '../services/syncService'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'generationHistory'
const SYNC_FLAG_KEY = 'hasSyncedToSupabase' // Store sync status per user
const MAX_LOCAL_ITEMS = 100

export function useGenerationHistory() {
  const { user, isAuthenticated } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSynced, setHasSynced] = useState(false)

  // Check sync status when user changes
  useEffect(() => {
    if (!user?.id) {
      setHasSynced(false)
      return
    }
    
    const syncedUsers = localStorage.getItem(SYNC_FLAG_KEY)
    if (!syncedUsers) {
      setHasSynced(false)
      return
    }
    
    try {
      const synced = JSON.parse(syncedUsers)
      setHasSynced(synced[user.id] === true)
    } catch {
      setHasSynced(false)
    }
  }, [user?.id])

  // Track deleted IDs to prevent race conditions where a fetch resurrects a deleted item
  const deletedIdsRef = useRef<Set<string>>(new Set())

  // Load history on mount or auth change
  // Use user?.id to prevent re-fetching on session token refreshes
  useEffect(() => {
    loadHistory()
  }, [user?.id, isAuthenticated])

  // Perform sync when user logs in and hasn't synced yet
  useEffect(() => {
    if (isAuthenticated && user?.id && !hasSynced) {
      performInitialSync()
    }
  }, [isAuthenticated, user?.id, hasSynced])

  const performInitialSync = async () => {
    if (!user) return

    try {
      await SyncService.performFullSync(user.id)
      
      // Mark this user as synced in localStorage
      const syncedUsers = localStorage.getItem(SYNC_FLAG_KEY)
      const synced = syncedUsers ? JSON.parse(syncedUsers) : {}
      synced[user.id] = true
      localStorage.setItem(SYNC_FLAG_KEY, JSON.stringify(synced))
      
      setHasSynced(true)
      // Reload history after sync
      await loadHistory()
    } catch (err) {
      console.error('Initial sync failed:', err)
    }
  }

  const loadHistory = async () => {
    // Only set loading to true if we don't already have history
    // This prevents the UI from "disappearing" during background refreshes
    if (history.length === 0) {
      setLoading(true)
    }
    setError(null)

    // Track if we've timed out
    let hasTimedOut = false
    
    // Safety timeout: if Supabase hangs, don't use localStorage for auth users
    const timeoutId = setTimeout(() => {
      hasTimedOut = true
      console.warn('[useGenerationHistory] Loading timed out')
      // For authenticated users: keep current state if it exists, otherwise empty
      if (!isAuthenticated) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            // Filter out any locally deleted items
            setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
          } catch {
            if (history.length === 0) setHistory([])
          }
        }
      }
      setLoading(false)
    }, 15000) // 15s timeout for slower connections

    try {
      if (isAuthenticated && user) {
        console.log('[useGenerationHistory] Fetching from Supabase for user:', user.id)
        const data = await GenerationService.getHistory(user.id, MAX_LOCAL_ITEMS)
        
        // Ignore result if we already timed out
        if (hasTimedOut) {
          console.log('[useGenerationHistory] Ignoring Supabase result (timed out)')
          return
        }
        
        console.log('[useGenerationHistory] Fetched', data.length, 'items from Supabase')
        
        // For authenticated users: ONLY use Supabase data
        // Filter out any items that were deleted while the fetch was in progress
        setHistory(data.filter(item => !deletedIdsRef.current.has(item.id)))
      } else {
        console.log('[useGenerationHistory] Not authenticated, using localStorage')
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
        } else {
          setHistory([])
        }
      }
    } catch (err) {
      if (hasTimedOut) return // Already handled by timeout
      
      console.error('[useGenerationHistory] Failed to load history:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      
      // For authenticated users: keep existing state if possible
      if (!isAuthenticated) {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          console.log('[useGenerationHistory] Error (guest), falling back to localStorage')
          try {
            const parsed = JSON.parse(stored)
            setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
          } catch {
            if (history.length === 0) setHistory([])
          }
        }
      }
    } finally {
      if (!hasTimedOut) {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }
  }

  const addItem = useCallback(
    async (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
      // Create a timeout promise - increased to 15s for slower connections
      const timeout = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Save operation timed out')), 15000)
      })

      try {
        let newItem: HistoryItem

        if (isAuthenticated && user) {
          // Save to Supabase with timeout
          console.log('[useGenerationHistory] Saving to Supabase...')
          newItem = await Promise.race([
            GenerationService.createGeneration(user.id, item),
            timeout
          ])
          console.log('[useGenerationHistory] Saved successfully to Supabase')
          // Optimistic update
          setHistory((prev) => [newItem, ...prev].slice(0, MAX_LOCAL_ITEMS))
          // Update localStorage cache
          const updated = [newItem, ...history].slice(0, MAX_LOCAL_ITEMS)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        } else {
          // Save to localStorage only (guest mode)
          newItem = {
            ...item,
            id: Date.now().toString(),
            timestamp: Date.now(),
          }
          const updated = [newItem, ...history].slice(0, MAX_LOCAL_ITEMS)
          setHistory(updated)
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        }
      } catch (err) {
        console.error('[useGenerationHistory] Failed to add history item:', err)
        setError(err instanceof Error ? err.message : 'Failed to save')
        // Fallback to localStorage on error
        const newItem: HistoryItem = {
          ...item,
          id: Date.now().toString(),
          timestamp: Date.now(),
        }
        const updated = [newItem, ...history].slice(0, MAX_LOCAL_ITEMS)
        setHistory(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        console.log('[useGenerationHistory] Saved to localStorage as fallback')
      }
    },
    [user, isAuthenticated, history]
  )

  const deleteItem = useCallback(
    async (id: string) => {
      try {
        // Track deletion to prevent race conditions with background fetches
        deletedIdsRef.current.add(id)

        // Optimistic update using functional state
        setHistory(prev => prev.filter((item) => item.id !== id))
        
        // ALWAYS delete from localStorage to keep it consistent
        // This prevents "zombie" items from reappearing if:
        // 1. The user refreshes (and initially loads from localStorage before auth)
        // 2. The sync service runs again
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const updated = parsed.filter((item: HistoryItem) => item.id !== id)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {
            // Ignore parse errors
          }
        }

        if (isAuthenticated && user) {
          // For authenticated users: ALSO delete from Supabase
          await GenerationService.deleteGeneration(id, user.id)
        } 
      } catch (err) {
        console.error('Failed to delete history item:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete')
        // Remove from tombstone on failure so reload can bring it back
        deletedIdsRef.current.delete(id)
        await loadHistory()
      }
    },
    [user, isAuthenticated]
  )

  const clearHistory = useCallback(async () => {
    try {
      if (isAuthenticated && user) {
        await GenerationService.clearHistory(user.id)
      }
      setHistory([])
      localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error('Failed to clear history:', err)
      setError(err instanceof Error ? err.message : 'Failed to clear')
    }
  }, [user, isAuthenticated])

  const deleteHistoryGroup = useCallback(
    async (item: HistoryItem) => {
      try {
        const mode = normalizeMode(item.mode || 'essay');
        const input = item.input;
        
        // Optimistic update: Remove ALL items with matching mode and input
        setHistory(prev => prev.filter((i) => {
           const iMode = normalizeMode(i.mode || 'essay');
           const iInput = i.input;
           // If mode and input match, filter it out
           return !(iMode === mode && iInput === input);
        }));

        // Clean up localStorage for all matching items
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const updated = parsed.filter((i: HistoryItem) => {
               const iMode = normalizeMode(i.mode || 'essay');
               const iInput = i.input;
               return !(iMode === mode && iInput === input);
            });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
          } catch {
            // Ignore parse errors
          }
        }

        if (isAuthenticated && user) {
          // Verify with backend deletion (batch delete by content)
          await GenerationService.deleteGenerationsByContent(user.id, input, mode)
        }
      } catch (err) {
        console.error('Failed to delete history group:', err)
        setError(err instanceof Error ? err.message : 'Failed to delete group')
        await loadHistory()
      }
    },
    [user, isAuthenticated]
  )
  
  // Helper to normalize mode (internal use)
  const normalizeMode = (mode: string): Mode => {
     const VALID_MODES: Mode[] = ['essay', 'cs', 'paraphrase', 'polish', 'casual'];
     if (VALID_MODES.includes(mode as Mode)) return mode as Mode;
     return 'essay';
  };

  return {
    history,
    loading,
    error,
    addItem,
    deleteItem,
    deleteHistoryGroup, // Export new method
    clearHistory,
    refresh: loadHistory,
  }
}

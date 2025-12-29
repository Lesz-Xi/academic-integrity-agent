import { useState, useEffect, useCallback, useRef } from 'react'
import type { HistoryItem, Mode } from '../types'
import { GenerationService } from '../services/generationService'
import { SyncService } from '../services/syncService'
import { useAuth } from '../contexts/AuthContext'

const STORAGE_KEY = 'generationHistory'
const SYNC_FLAG_KEY = 'hasSyncedToSupabase' // Store sync status per user
const MAX_LOCAL_ITEMS = 20

export function useGenerationHistory() {
  const { user, isAuthenticated, loading: loadingAuth } = useAuth()
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSynced, setHasSynced] = useState(false)

  // Track deleted IDs to prevent race conditions where a fetch resurrects a deleted item
  const deletedIdsRef = useRef<Set<string>>(new Set())
  
  // Track active network requests for abortion
  const abortControllerRef = useRef<AbortController | null>(null);

  // Track request ownership to prevent race conditions
  const requestRef = useRef<number>(0)

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

  // Load history on mount or auth change
  // Use user?.id to prevent re-fetching on session token refreshes
  useEffect(() => {
    loadHistory()
  }, [user?.id, isAuthenticated])

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

  // Load history on mount or auth change
  const loadHistory = useCallback(async (forceReload = false) => {
    // If we're currently initializing auth, WAIT. Don't fetch yet.
    if (loadingAuth && isAuthenticated) {
         console.log('[useGenerationHistory] Waiting for auth loading to complete...')
         return; 
    }

    const requestId = ++requestRef.current
    
    // Only set loading if we don't have data, or if forcing
    if (history.length === 0 || forceReload) {
      setLoading(true)
    }
    setError(null)

    // Track if we've timed out
    let hasTimedOut = false
    
    // ABORT LOGIC: Sovereign Resource Control
    // Create controller BEFORE timeout so we can abort on timeout
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    
    // Safety timeout - AGGRESSIVE: 5 seconds is plenty for 20 rows
    // If network is blocked, fail fast and use local data
    const timeoutId = setTimeout(() => {
      hasTimedOut = true
      
      // CRITICAL: Abort the pending network request to free resources
      controller.abort();
      
      if (requestRef.current === requestId) {
         console.log('[useGenerationHistory] Loading timed out - using local fallback (Sovereign Shield Active)')
         // Fallback logic for timeout...
         // ALWAYS try fallback, even if authenticated (Sovereign Fallback)
         const stored = localStorage.getItem(STORAGE_KEY)
         if (stored) {
             try {
                const parsed = JSON.parse(stored)
                setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
                console.log('[useGenerationHistory] Loaded fallback history from localStorage (Timeout)')
             } catch { /* ignore */ }
         } else {
             // FORENSIC RECOVERY: Check for backups if main cache is empty
             try {
                 const backupKey = Object.keys(localStorage)
                    .filter(k => k.startsWith(STORAGE_KEY + '_backup_'))
                    .sort().pop();
                 
                 if (backupKey) {
                     const backup = localStorage.getItem(backupKey);
                     if (backup) {
                         const parsed = JSON.parse(backup);
                         setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)));
                         localStorage.setItem(STORAGE_KEY, backup);
                         console.log(`[useGenerationHistory] RECOVERED history from forensic backup: ${backupKey}`);
                     }
                 }
             } catch (err) {
                 console.warn('[useGenerationHistory] Forensic recovery failed:', err);
             }
         }
         
         setLoading(false)
      }
    }, 5000) // Reduced from 15s to 5s for faster fallback

    try {
      if (isAuthenticated && user) {
        console.log('[useGenerationHistory] Fetching from Supabase for user:', user.id)
        
        // Retry Loop (1 retry)
        let data: HistoryItem[] | null = null;
        let attempt = 1;
        const maxAttempts = 2; // Try twice
        
        while (attempt <= maxAttempts && !data) {
            if (controller.signal.aborted) break; // Exit loop if aborted
            try {
                 // Use lighter initial fetch (20 items vs 100) WITH ABORT SIGNAL
                 data = await GenerationService.getHistory(user.id, 20, 0, controller.signal);
            } catch (e: any) {
                if (e.name === 'AbortError' || controller.signal.aborted) {
                    console.log('[useGenerationHistory] Request aborted cleanly');
                    return; // Silent exit
                }
                
                console.warn(`[useGenerationHistory] Fetch attempt ${attempt} failed:`, e);
                if (attempt < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000)); // Wait 2s before retry
                } else {
                    throw e; // Throw actual error if all attempts fail
                }
            }
            attempt++;
        }
        
      if (controller.signal.aborted) return;

      // Race condition check: Is this still the active request?
      // SOVEREIGN FIX: If we have data, USE IT. Don't be strict about IDs in dev mode.
      const isLatest = requestRef.current === requestId;
      const isDevDoubleInvoke = requestRef.current === requestId + 1; // Handle React Strict Mode
      
      if ((isLatest || isDevDoubleInvoke) && !hasTimedOut && data && data.length > 0) {
          console.log('[useGenerationHistory] Fetched path successful for:', user.id)
          setHistory(data.filter(item => !deletedIdsRef.current.has(item.id)))
      } else if (data && data.length > 0 && !controller.signal.aborted) {
          // Greedy Fallback: If we got data but ID mismatch, still use it if history is empty
          if (history.length === 0) {
             console.log('[useGenerationHistory] Accepting stale but valid result (Greedy Fallback)')
             setHistory(data.filter(item => !deletedIdsRef.current.has(item.id)))
          } else {
             console.log('[useGenerationHistory] Ignoring stale result (History already populated)')
          }
      } else {
          console.log('[useGenerationHistory] Ignoring empty or stale result')
      }
    } else {
      // Guest Mode (localStorage) logic
      if (requestRef.current === requestId) {
          const stored = localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
          } else {
            setHistory([])
          }
      }
    }
  } catch (err: any) { 
       if (err.name === 'AbortError') {
           console.log('[useGenerationHistory] Aborted handled in catch block');
           return;
       }
       // ... existing error handling ...
       if (requestRef.current === requestId && !hasTimedOut) {
          console.error('[useGenerationHistory] Failed to load history:', err)
          setError(err instanceof Error ? err.message : 'Unknown error')
          
          // Fallback to cache on error - EVEN IF AUTHENTICATED (Sovereign Fallback)
           const stored = localStorage.getItem(STORAGE_KEY)
           if (stored) {
              try {
                const parsed = JSON.parse(stored)
                setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)))
                console.log('[useGenerationHistory] Loaded fallback history from localStorage (Timeout)')
              } catch { /* ignore */ }
           } else {
             // FORENSIC RECOVERY: Check for backups if main cache is empty
             try {
                 const backupKey = Object.keys(localStorage)
                    .filter(k => k.startsWith(STORAGE_KEY + '_backup_'))
                    .sort().pop();
                 
                 if (backupKey) {
                     const backup = localStorage.getItem(backupKey);
                     if (backup) {
                         const parsed = JSON.parse(backup);
                         setHistory(parsed.filter((item: HistoryItem) => !deletedIdsRef.current.has(item.id)));
                         localStorage.setItem(STORAGE_KEY, backup);
                         console.log(`[useGenerationHistory] RECOVERED history from forensic backup: ${backupKey}`);
                     }
                 }
             } catch (err) {
                 console.warn('[useGenerationHistory] Forensic recovery failed:', err);
             }
           }
      }
      if (requestRef.current === requestId || requestRef.current === requestId + 1) { // Relaxed cleanup
        clearTimeout(timeoutId)
        setLoading(false)

        if (isAuthenticated && user?.id && !hasSynced) {
            console.log('[useGenerationHistory] History loaded, triggering background sync...')
            // Use setTimeout to yield to main thread/UI render completely
            setTimeout(() => performInitialSync(), 2000);
        }
      }
  }
}, [user, isAuthenticated, hasSynced]) // REMOVED history.length and loadingAuth

  // Effect Trigger
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

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

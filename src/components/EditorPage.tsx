import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Download, X, AlertTriangle, Sun, Moon, RotateCcw, Wand2, Flame, Loader2 } from 'lucide-react';
import { DraftService } from '../services/draftService';
import { AttestationService } from '../services/attestationService';
import { SimplificationSuggestion, ParagraphAnalysis } from '../services/analysisService';
import { Draft, DraftSnapshot } from '../types';
import PerplexityBackdrop from './PerplexityBackdrop';
import { StatusIndicator, SecurityStatus } from './StatusIndicator';
import AuditModal from './AuditModal';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database.types';

interface EditorPageProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function EditorPage({ onBack, theme, toggleTheme }: EditorPageProps) {
  const { user } = useAuth();
  // State
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Essay');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // New explicit loading state
  const [initError, setInitError] = useState<string | null>(null);
  // [SOVEREIGNTY] Persist the client used for initialization (Standard or Emergency)
  // This ensures subsequent saves/attestations use the SAME transport that succeeded.
  const [sovereignClient, setSovereignClient] = useState<SupabaseClient<Database> | null>(null); // New error state
  const [_lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sovereigntyScore, setSovereigntyScore] = useState(100);
  const [showHistory, setShowHistory] = useState(true);
  const [showAuditModal, setShowAuditModal] = useState(false);
  
  // Anti-Thesaurus State
  const [showAntiThesaurus, setShowAntiThesaurus] = useState(false);
  const [simplifications] = useState<SimplificationSuggestion[]>([]);

  // Perplexity Heatmap State
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sentenceAnalysis] = useState<ParagraphAnalysis[]>([]);

  // Refs
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef('');
  const isPasteRef = useRef(false);
  const promotionInProgressRef = useRef<Promise<Draft | null> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Removed initializationInProgressRef - using state + effect cleanup instead

  // Computed Security Status
  const getSecurityStatus = (): SecurityStatus => {
    const latestSnap = snapshots[0];
    
    // 1. Initial Loading or Saving -> Monitored (Blue/Yellow)
    if (isInitializing || isSaving) return 'monitored';
    
    // 2. Genesis State (No snapshots yet) -> Sovereign (Green)
    if (!latestSnap) return 'sovereign'; 
    
    // 3. [SOVEREIGNTY SAFETY] If the forensic score drops below 80, override everything.
    // This catches "authorized" saves that were actually massive pastes.
    if (sovereigntyScore < 80) return 'compromised';

    // 4. Optimistic Snapshots (Client-side only, pending server hash) -> Monitored
    // These are created instantly on type; we shouldn't flagging them as compromised just because the server hasn't replied yet.
    if (latestSnap.id.startsWith('temp-')) return 'monitored';
    
    // 5. Missing Hash on a REAL (server-confirmed) snapshot -> Compromised (Red)
    // This implies the database record exists but has no hash (tampering) or the chain is broken.
    if (!latestSnap.integrityHash) return 'compromised';

    // 6. Default -> Sovereign
    return 'sovereign';
  };

  // Initialization & Effects
  useEffect(() => {
    initializeDraft();
    
    // Cleanup function not needed for the async calls themselves, 
    // but we might want to cancel pending requests if Supabase supports it (AbortController).
    // For now, state checks like 'mounted' inside initializeDraft are enough.
    return () => {
        // cleanup if needed
    };
  }, [user?.id]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  // Logic
  const initializeDraft = async (force: boolean = false) => {
    if (!user) return;
    
    // If not forcing (e.g. initial load), and we already have a draft for this user, skip.
    if (!force && draft && draft.userId === user.id) {
        setIsInitializing(false);
        return;
    }

    setIsInitializing(true);
    setInitError(null);

    try {
        console.log('[Editor] Initializing draft session...');
        
        // [SOVEREIGNTY HARDENING] 
        // Use Emergency Client to bypass potential global auth deadlocks/race conditions.
        // This ensures the INSERT operation has a dedicated, authenticated client instance.
        const emergencyClient = await DraftService.getEmergencyClient();
        const clientToUse = emergencyClient || supabase; // Fallback to global default if null
        
        // Persist this client for the session lifecycle
        setSovereignClient(clientToUse);
        
        if (emergencyClient) {
             console.log('[Editor] 🛡️ Using Emergency Client for Draft Creation');
        }

        // Pass user.id and client to createDraft.
        const draftPromise = DraftService.createDraft(user.id, 'Untitled Draft', clientToUse);
        const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Initialization timed out')), 45000)
        );

        const newDraft = await Promise.race([draftPromise, timeoutPromise]);
        
        if (newDraft) {
            console.log('[Editor] Draft session established:', newDraft.id);
            setDraft(newDraft);
            setTitle(newDraft.title);
            setContent(newDraft.currentContent);
            setSnapshots([]);
            previousContentRef.current = newDraft.currentContent;
            setLastSaved(new Date());
        } else {
            // If explicit null returned (e.g. error caught in service), throw
            throw new Error('Failed to create draft session (Service returned null)');
        }
    } catch (e: any) {
        console.error('[Editor] Initialization failed:', e);
        setInitError(e.message || 'Unable to establish secure draft session.');
    } finally {
        setIsInitializing(false);
    }
  };
  
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  // Event Handlers
  const handlePaste = () => {
    isPasteRef.current = true;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    adjustTextareaHeight();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    // Note: isSaving is now set INSIDE saveDraft to avoid state leak if draft is null
    
    // Immediate save if it was a paste
    if (isPasteRef.current) {
      isPasteRef.current = false;
      saveDraft(newContent, true);
      return;
    }

    // Debounced save for typing
    timeoutRef.current = setTimeout(() => {
      saveDraft(newContent, false);
    }, 2000); // 2s debounce
  };

  // Helper: Save Draft
  const saveDraft = async (currentContent: string, isPaste: boolean) => {
    if (!draft) {
      console.warn('[Editor] saveDraft called but draft is null, skipping.');
      return;
    }
    
    // Set isSaving HERE (after guard) so the finally block will always reset it
    setIsSaving(true);
    
    // 1. Calculate Delta & Optimistic Snapshot
    const prevLen = previousContentRef.current?.length || 0;
    const charDelta = currentContent.length - prevLen;
    const diffThreshold = 0; 
    
    if (Math.abs(charDelta) > diffThreshold || isPaste) {
       const optimisticSnapshot: DraftSnapshot = {
         id: `temp-${Date.now()}`,
         draftId: draft.id,
         timestamp: new Date().toISOString(),
         contentDiff: null,
         charCountDelta: charDelta,
         pasteEventDetected: isPaste,
         integrityHash: undefined // Explicitly undefined until server confirms
       };
       
       setSnapshots(prev => [optimisticSnapshot, ...prev]);
       const allSnaps = [optimisticSnapshot, ...snapshots];
       const newScore = DraftService.computeScore(allSnaps);
       setSovereigntyScore(newScore);
    }

    // 2. Perform Server Update (Background)
    const oldContent = previousContentRef.current || '';
    previousContentRef.current = currentContent;

    const updatePromise = DraftService.updateDraft(
      draft.id, 
      currentContent, 
      oldContent, 
      isPaste, 
      draft.userId,
      (promotedDraft) => {
        console.log('[Editor] Draft promoted, updating state immediately:', promotedDraft.id);
        setDraft(promotedDraft);
      },
      sovereignClient || undefined // <--- Pass the Sovereign Client!
    );
    
    promotionInProgressRef.current = updatePromise;
    
    updatePromise.then(async (updated) => {
        promotionInProgressRef.current = null;
        
        if (updated) {
           setDraft(updated);
           setLastSaved(new Date());
           // [SOVEREIGNTY FIX] Use sovereignClient to avoid global client deadlock
           const clientToUse = sovereignClient || supabase;
           const [score, latestSnapshots] = await Promise.all([
            DraftService.calculateSovereigntyScore(updated.id, clientToUse),
            DraftService.getSnapshots(updated.id, clientToUse)
           ]);
           setSovereigntyScore(score);
           
           if (latestSnapshots && latestSnapshots.length > 0) {
              setSnapshots(latestSnapshots);
           }
        }
      })
      .catch((err) => {
          console.error('[Editor] Auto-save failed:', err);
          // Keep optimistic snapshot but maybe flag error?
          // The StatusIndicator will show 'gap-detected' because isSaving becomes false 
          // and optimistic snapshot has no hash. Correct behavior.
      })
      .finally(() => {
          setIsSaving(false);
      });
  };



  const handleHighlightSuggestion = (suggestion: SimplificationSuggestion) => {
      if (!textareaRef.current) return;
      
      const { index, length } = suggestion;
      
      // Focus and Select the word
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(index, index + length);
      
      // Attempt to scroll into view (blur/focus trick often forces scroll)
      // const fullText = textareaRef.current.value;
      // const lines = fullText.substring(0, index).split('\n');
      // Approximate scroll if needed, but setSelectionRange usually handles it.
  };

  const handleApplySimplification = (suggestion: SimplificationSuggestion, replacement: string) => {
      const { index, length, original } = suggestion;
      
      // Simple Case Matching
      let finalReplacement = replacement;
      if (original[0] === original[0].toUpperCase() && original[0] !== original[0].toLowerCase()) {
          // Check if all caps
          if (original === original.toUpperCase() && original.length > 1) {
              finalReplacement = replacement.toUpperCase();
          } else {
              // Title Case
              finalReplacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
      }

      // Robust Replacement using exact index
      // We verify the text hasn't shifted significantly (basic safety)
      const targetText = content.slice(index, index + length);
      if (targetText.toLowerCase() !== original.toLowerCase()) {
         // Content has shifted; abort to prevent corruption
         // The scanner will re-run shortly
         return; 
      }
      
      const newContent = content.slice(0, index) + finalReplacement + content.slice(index + length);
      
      setContent(newContent);
      saveDraft(newContent, false);
      
      // Restore focus to editor mostly? Or allow next click.
  };

  const handleAttest = async () => {
    if (!draft) return;
    
    let targetDraft = draft;
    
    // [SOVEREIGNTY PATTERN] Wrap ALL async operations in try/finally
    // to guarantee isSaving state is always reset, even on error.
    // This is the "Black Box" reliability standard.
    
    try {
      setIsSaving(true);
      
      // FIX: Wait for any pending save/promotion operation to complete first
      if (promotionInProgressRef.current) {
          console.log('[Editor] Waiting for pending save operation to complete...');
          try {
              const pendingResult = await promotionInProgressRef.current;
              if (pendingResult && !pendingResult.id.startsWith('local-')) {
                  console.log('[Editor] Pending save resolved with server draft:', pendingResult.id);
                  targetDraft = pendingResult;
                  setDraft(pendingResult);
                  // Draft is now promoted, proceed directly to attestation
                  await AttestationService.generateCertificate(targetDraft, sovereigntyScore, sovereignClient || undefined);
                  return;
              }
          } catch (e) {
              console.warn('[Editor] Pending save failed, will attempt fresh promotion:', e);
          }
          // Re-read draft state in case callback updated it
          targetDraft = draft;
      }

      // Safety: If draft is still local (offline/race condition), force sync to server first
      if (targetDraft.id.startsWith('local-')) {
          console.log('[Editor] Force-promoting local draft before attestation...');
          const promoted = await DraftService.updateDraft(
              targetDraft.id, 
              content, 
              previousContentRef.current, 
              false,
              targetDraft.userId,
              (newDraft) => {
                  console.log('[Editor] Attestation promotion callback fired:', newDraft.id);
                  setDraft(newDraft);
              },
              sovereignClient || undefined
          );
          
          if (promoted && !promoted.id.startsWith('local-')) {
              console.log('[Editor] Promotion success. New ID:', promoted.id);
              targetDraft = promoted;
              setDraft(promoted);
          } else {
              throw new Error('Promotion returned null or local ID');
          }
      }

      // Final attestation call - now wrapped in the outer try/finally
      // [SOVEREIGNTY FIX] Fetch strict, up-to-the-millisecond forensic score from DB
      // This bypasses any React state lag (e.g. if user pasted and immediately clicked Attest)
      const clientToUse = sovereignClient || supabase;
      const liveForensicScore = await DraftService.calculateSovereigntyScore(targetDraft.id, clientToUse);
      console.log(`[Editor] Authorized Attestation. UI Score: ${sovereigntyScore}%, Forensic Score: ${liveForensicScore}%`);
      
      await AttestationService.generateCertificate(targetDraft, liveForensicScore, clientToUse);
      
    } catch (error: any) {
      console.error('[Editor] Attestation failed:', error);
      alert(`Attestation failed: ${error?.message || 'Unknown error'}. Please try again.`);
    } finally {
      // [SOVEREIGNTY GUARANTEE] Always reset isSaving, no matter what
      setIsSaving(false);
    }
  };
  
  const handleReset = async () => {
    if (content.trim().length > 0) {
      if (!window.confirm("Are you sure you want to start a new draft? The current content will be cleared.")) {
        return;
      }
    }
    await initializeDraft(true);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 font-sans flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 sm:px-6 bg-white/50 dark:bg-black/50 backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 opacity-70" />
          </button>
          
          <div className="flex flex-col min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                if (draft && title !== draft.title) {
                  DraftService.updateTitle(draft.id, title);
                }
              }}
              className="text-sm font-bold tracking-wide bg-transparent border-b border-transparent hover:border-black/20 dark:hover:border-white/20 focus:border-black/40 dark:focus:border-white/40 outline-none px-1 -mx-1 transition-colors truncate w-32 sm:w-auto"
              placeholder="Document Title..."
            />
            <div className="flex items-center pl-1">
              <StatusIndicator 
                status={getSecurityStatus()}
                isPremium={true} // Hardcoded for simplified check, or verify logic
                className="scale-90 origin-left border-transparent bg-transparent pl-0"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-6 flex-shrink-0">
          <button 
            onClick={handleReset}
            className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
            title="Start New Draft / Reset"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 opacity-70 hover:opacity-100 transition-opacity" />
          </button>
          
          {/* Heatmap Toggle */}
          <button 
             onClick={() => {
                 setShowHeatmap(!showHeatmap);
                 setShowAntiThesaurus(false);
                 setShowHistory(false);
             }}
             className={`p-1.5 sm:p-2 rounded-full transition-all flex-shrink-0 ${
                 showHeatmap 
                   ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' 
                   : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
             }`}
             title="Perplexity Heatmap (Visualize Human vs AI)"
           >
             <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>

          {/* Anti-Thesaurus Toggle */}
          <button 
             onClick={() => {
                 setShowAntiThesaurus(!showAntiThesaurus);
                 setShowHeatmap(false);
                 setShowHistory(false);
             }}
             className={`p-1.5 sm:p-2 rounded-full transition-all flex-shrink-0 ${
                 showAntiThesaurus 
                   ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' 
                   : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'
             }`}
             title="Anti-Thesaurus (Simplify Vocabulary)"
           >
             <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" />
           </button>

          <button 
             onClick={toggleTheme}
             className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors flex-shrink-0"
             title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
           >
             {theme === 'dark' ? (
               <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-[#C1A87D]" />
             ) : (
               <Moon className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
             )}
           </button>

           <button 
             onClick={() => setShowAuditModal(true)}
             className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border transition-transform active:scale-95 ${
             sovereigntyScore > 80 
               ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-500/20 cursor-pointer' 
               : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-500/20 cursor-pointer'
           }`}>
             <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
             <span className="text-[10px] sm:text-xs font-bold tracking-wide">{sovereigntyScore}%</span>
           </button>

          <button 
            className={`p-1.5 sm:p-2 rounded-full transition-colors relative ${
                showHistory 
                  ? 'bg-black/10 dark:bg-white/10 opacity-100' 
                  : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70'
            }`}
            title="Version History"
            onClick={() => {
                setShowHistory(!showHistory);
                setShowAntiThesaurus(false);
            }}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          
          <button 
              onClick={handleAttest}
              disabled={isSaving || isInitializing || !draft}
              className={`
                flex items-center gap-2 px-4 py-2 bg-white text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-gray-200 transition-colors
                ${(isSaving || isInitializing || !draft) ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Attest</span>
                </>
              )}
            </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex justify-center overflow-y-auto">
          <div className="w-full max-w-3xl py-12 px-8 relative"> {/* Added relative for backdrop positioning */}
            
            {/* Loading / Error Overlay */}
            {(isInitializing || initError) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#FDFBF7]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-sm transition-all duration-300">
                    {initError ? (
                        <div className="text-center p-6 max-w-sm sm:max-w-md bg-white dark:bg-black/40 border border-red-200 dark:border-red-900/50 rounded-2xl shadow-xl">
                            <div className="bg-red-50 dark:bg-red-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2">Protocol Error</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed px-4">{initError}</p>
                            <button 
                                onClick={() => initializeDraft(true)}
                                className="w-full px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold tracking-wide hover:opacity-90 transition-all active:scale-95 shadow-lg"
                            >
                                RETRY CONNECTION
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-500">
                             <div className="relative">
                                <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 rounded-full"></div>
                                <div className="absolute inset-0 w-12 h-12 border-4 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
                             </div>
                            <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-70 animate-pulse">Establishing Secure Link...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Perplexity Heatmap Backdrop */}
            {showHeatmap && !isInitializing && (
                <PerplexityBackdrop 
                  content={content}
                  analysis={sentenceAnalysis}
                  theme={theme}
                  className="py-12 px-8 font-sans text-lg leading-relaxed dark:text-gray-200"
                />
            )}

            <textarea
              ref={textareaRef}
              className="w-full h-full min-h-[80vh] bg-transparent resize-none outline-none text-lg leading-relaxed placeholder-gray-400/40 dark:placeholder-gray-600/40 text-gray-800 dark:text-gray-200 selection:bg-purple-100 dark:selection:bg-purple-900/30 relative z-10 overflow-hidden"
              placeholder="Start drafting here to prove your process..."
              value={content}
              onChange={handleContentChange}
              onPaste={handlePaste}
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>

        {/* Sidebar: Anti-Thesaurus Panel */}
        {showAntiThesaurus && (
           <aside className="fixed inset-y-0 right-0 z-50 w-80 border-l border-black/5 dark:border-white/5 bg-white/95 dark:bg-black/95 backdrop-blur p-6 overflow-y-auto shadow-2xl sm:relative sm:w-80 sm:bg-white/50 sm:dark:bg-black/50 sm:shadow-none sm:h-auto top-16 sm:top-0 border-l-purple-500/10 bg-purple-50/50 dark:bg-purple-900/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                 <h3 className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200">Anti-Thesaurus</h3>
              </div>
              <button onClick={() => setShowAntiThesaurus(false)} className="sm:hidden p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
               AI models love complex words. Use simpler alternatives to increase perplexity and sound more human.
            </p>

            <div className="space-y-4">
               {simplifications.length === 0 ? (
                   <div className="text-center py-12 opacity-50">
                       <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500/50" />
                       <p className="text-xs font-medium">No complex words found.</p>
                       <p className="text-[10px]">Your writing is beautifully simple.</p>
                   </div>
               ) : (
                   simplifications.map((item, idx) => (
                       <div 
                        key={idx} 
                        onClick={() => handleHighlightSuggestion(item)}
                        className="bg-white dark:bg-gray-900 border border-purple-200 dark:border-purple-800/30 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                       >
                           <div className="flex items-center justify-between mb-2">
                               <span className="text-sm font-bold text-red-500 line-through decoration-2 decoration-red-200 group-hover:opacity-80 transition-opacity">{item.original}</span>
                               <span className="text-[10px] text-gray-400 uppercase tracking-wide">Replace with</span>
                           </div>
                           <div className="flex flex-wrap gap-2">
                               {item.replacements.map(rep => (
                                   <button 
                                      key={rep}
                                      onClick={(e) => {
                                          e.stopPropagation(); // Prevent scroll jump when clicking replace
                                          handleApplySimplification(item, rep);
                                      }}
                                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                   >
                                       {rep}
                                   </button>
                               ))}
                           </div>
                       </div>
                   ))
               )}
            </div>
           </aside>
        )}

        {/* Sidebar: Version History */}
        {showHistory && (
          <aside className="fixed inset-y-0 right-0 z-50 w-80 border-l border-black/5 dark:border-white/5 bg-white/95 dark:bg-black/95 backdrop-blur p-6 overflow-y-auto shadow-2xl sm:relative sm:w-80 sm:bg-white/50 sm:dark:bg-black/50 sm:shadow-none sm:h-auto top-16 sm:top-0">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider opacity-50">Timeline</h3>
              <button onClick={() => setShowHistory(false)} className="sm:hidden p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
                <X className="w-4 h-4 opacity-50" />
              </button>
            </div>
            
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-px before:bg-black/5 dark:before:bg-white/5">
              
              {/* Live Current State */}
              <div className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <div className="text-xs font-bold">Current Draft</div>
                <div className="text-[10px] opacity-50">Editing now...</div>
              </div>

              {/* Snapshots Logic */}
              {snapshots.map((snap) => (
                <div key={snap.id} className="relative pl-8 animate-in slide-in-from-left-2 duration-300">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border flex items-center justify-center ${
                    snap.pasteEventDetected 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      snap.pasteEventDetected ? 'bg-red-500' : 'bg-black/20 dark:bg-white/20'
                    }`}></div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">
                      {snap.pasteEventDetected ? 'High-Volume Paste' : 'Auto-Save'}
                    </span>
                    <span className="text-[10px] opacity-50">
                      {new Date(snap.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`text-[10px] mt-0.5 font-medium ${
                      snap.charCountDelta > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600'
                    }`}>
                      {snap.charCountDelta > 0 ? '+' : ''}{snap.charCountDelta} chars
                    </span>
                  </div>
                </div>
              ))}
              
              {snapshots.length === 0 && (
                 <div className="relative pl-8 opacity-50">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-black/20 dark:bg-white/20"></div>
                  </div>
                  <div className="text-xs font-bold">Session Start</div>
                  <div className="text-[10px] opacity-50">Ready to track</div>
                </div>
              )}
            </div>
            
            <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-700 dark:text-yellow-400 leading-relaxed">
                  <strong>Pro Tip:</strong> Avoid pasting large blocks of text. It lowers your Sovereignty Score.
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <AuditModal 
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        theme={theme}
        snapshots={snapshots}
        sovereigntyScore={sovereigntyScore}
        draftId={draft?.id || 'offline-draft'}
      />
    </div>
  );
}

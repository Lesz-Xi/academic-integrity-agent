import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Download, X, AlertTriangle, Sun, Moon, RotateCcw, Wand2, Flame } from 'lucide-react';
import { DraftService } from '../services/draftService';
import { AttestationService } from '../services/attestationService';
import { AnalysisService, SimplificationSuggestion, SentenceAnalysis, ParagraphAnalysis } from '../services/analysisService';
import { Draft, DraftSnapshot } from '../types';
import PerplexityBackdrop from './PerplexityBackdrop';
import { useAuth } from '../contexts/AuthContext';

interface EditorPageProps {
  onBack: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export default function EditorPage({ onBack, theme, toggleTheme }: EditorPageProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('Untitled Essay');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]); 
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sovereigntyScore, setSovereigntyScore] = useState(100);
  const [showHistory, setShowHistory] = useState(true); // Default: Open Timeline
  
  // Anti-Thesaurus State
  const [showAntiThesaurus, setShowAntiThesaurus] = useState(false);
  const [simplifications, setSimplifications] = useState<SimplificationSuggestion[]>([]);

  // Perplexity Heatmap State
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<ParagraphAnalysis[]>([]);

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef('');

  // 1. Initialize Draft on Mount
  useEffect(() => {
    if (!user) return;
    initializeDraft();
  }, [user]);
  
  // Anti-Thesaurus & Heatmap Auto-Scan
  useEffect(() => {
    if (content) {
        // Debounce scan slightly to avoid lag on huge texts
        const timer = setTimeout(() => {
            if (showAntiThesaurus) {
                const suggestions = AnalysisService.scanForSimplification(content);
                setSimplifications(suggestions);
            }
            if (showHeatmap) {
                // Phase 4: Burstiness Analysis
                const analysis = AnalysisService.analyzeBurstiness(content);
                setSentenceAnalysis(analysis);
            }
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [content, showAntiThesaurus, showHeatmap]);
  
  const initializeDraft = async () => {
    if (!user) return;
    
    // Attempt to create on server with explicit 2s timeout
    // Sentinel value for timeout
    const TIMEOUT_TOKEN = Symbol('TIMEOUT');
    
    // Timeout Promise
    const timeoutPromise = new Promise<typeof TIMEOUT_TOKEN>((resolve) => 
        setTimeout(() => resolve(TIMEOUT_TOKEN), 2000)
    );

    let newDraft: Draft | null | typeof TIMEOUT_TOKEN = null;

    try {
        newDraft = await Promise.race([
            DraftService.createDraft(user.id, 'Untitled Essay'),
            timeoutPromise
        ]);
    } catch (e) {
        console.warn('[Editor] Draft creation threw error:', e);
        newDraft = null;
    }
    
    // FALLBACK: Local Mode (Sovereign Offline)
    // Trigger if null (failed) OR if it's the timeout token
    if (!newDraft || newDraft === TIMEOUT_TOKEN) {
        console.warn('[Editor] Server initialization failed or timed out. Creating local offline draft.');
        newDraft = {
            id: `local-${Date.now()}`, // Local ID
            userId: user.id,
            title: 'Untitled Essay (Offline)',
            currentContent: '',
            lastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
    }
    
    // Type guard: newDraft is now definitely Draft type because we assigned a fallback if it wasn't
    const validDraft = newDraft as Draft;

    if (validDraft) {
      setDraft(validDraft);
      setTitle(validDraft.title);
      setLastSaved(new Date());
      setSnapshots([]);
      setSovereigntyScore(100);
      setContent('');
      previousContentRef.current = '';
    }
  };

  const isPasteRef = useRef(false);

  // Auto-resize logic
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, window.innerHeight * 0.8)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [content]);

  // Event Handlers Restored
  const handlePaste = () => {
    isPasteRef.current = true;
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    adjustTextareaHeight();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsSaving(true);
    
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
    if (!draft) return;
    
    // 1. Calculate Delta & Optimistic Snapshot
    const charDelta = currentContent.length - previousContentRef.current.length;
    // Lower threshold to capture all typing bursts
    const diffThreshold = 0; 
    
    // Create snapshot for any change (debounced)
    if (Math.abs(charDelta) > diffThreshold || isPaste) {
       const optimisticSnapshot: DraftSnapshot = {
         id: `temp-${Date.now()}`, // Temporary ID
         draftId: draft.id,
         timestamp: new Date().toISOString(),
         contentDiff: null,
         charCountDelta: charDelta,
         pasteEventDetected: isPaste
       };
       
       // Optimistic Update: Add to timeline immediately
       setSnapshots(prev => [optimisticSnapshot, ...prev]);
       
       // Optimistic Score Update
       const allSnaps = [optimisticSnapshot, ...snapshots];
       const newScore = DraftService.computeScore(allSnaps);
       setSovereigntyScore(newScore);
    }

    // 2. Perform Server Update (Background)
    const oldContent = previousContentRef.current; // Capture for server call
    previousContentRef.current = currentContent; // Update local ref immediately
    
    // Fire and forget (or rather, fire and reconcile)
    DraftService.updateDraft(draft.id, currentContent, oldContent, isPaste)
      .then(async (updated) => {
        if (updated) {
           setDraft(updated);
           setLastSaved(new Date());
           // Re-fetch authoritative state to replace optimistic one
           const [score, latestSnapshots] = await Promise.all([
            DraftService.calculateSovereigntyScore(draft.id),
            DraftService.getSnapshots(draft.id)
           ]);
           setSovereigntyScore(score);
           
           // Safety Check: If server returns empty but we have local snapshots,
           // it might be a sync failure. Keep optimistic state + server state.
           if (latestSnapshots && latestSnapshots.length > 0) {
              setSnapshots(latestSnapshots);
           } else if (latestSnapshots.length === 0 && snapshots.length > 0) {
              console.warn('[Timeline] Server returned empty snapshots. Preserving optimistic state.');
              // Don't wipe state.
           }
        }
      });
      
    setIsSaving(false);
  };

  // Duplicates removed. The versions with logging are now at the top of the component.
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    await AttestationService.generateCertificate(draft, snapshots, sovereigntyScore);
  };
  
  const handleReset = async () => {
    if (content.trim().length > 0) {
      if (!window.confirm("Are you sure you want to start a new draft? The current content will be cleared.")) {
        return;
      }
    }
    await initializeDraft();
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
            <div className="text-xs opacity-50 flex items-center gap-2 truncate">
              {isSaving ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <span className="truncate">Last saved: {lastSaved?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
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

           <div className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border ${
            sovereigntyScore > 80 
              ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
          }`}>
            <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-[10px] sm:text-xs font-bold tracking-wide">{sovereigntyScore}%</span>
          </div>

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
            className="flex items-center gap-1 sm:gap-2 bg-black dark:bg-white text-white dark:text-black px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>ATTEST</span>
          </button>
        </div>
      </header>

      {/* Main Canvas */}
      <main className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative flex justify-center overflow-y-auto">
          <div className="w-full max-w-3xl py-12 px-8 relative"> {/* Added relative for backdrop positioning */}
            
            {/* Perplexity Heatmap Backdrop */}
            {showHeatmap && (
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
    </div>
  );
}

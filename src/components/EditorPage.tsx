import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, ShieldCheck, Download, X, AlertTriangle, Sun, Moon } from 'lucide-react';
import { DraftService } from '../services/draftService';
import { AttestationService } from '../services/attestationService';
import { Draft, DraftSnapshot } from '../types';
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
  const [showHistory, setShowHistory] = useState(true);

  // Debounce ref
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef('');

  // 1. Initialize Draft on Mount
  useEffect(() => {
    if (!user) return;
    
    // For MVP, we'll create a new draft or load the last one.
    // Ideally, we'd have a DraftPicker. defaulting to "New Draft" for now.
    async function init() {
      // Logic to fetch existing or create new would go here.
      // Simulating "New Draft" for demo speed.
      const newDraft = await DraftService.createDraft(user!.id, 'Untitled Essay');
      if (newDraft) {
        setDraft(newDraft);
        setTitle(newDraft.title);
        setLastSaved(new Date());
        
        // Load initial state if any (though new draft is empty)
        // In a real app we'd load existing draft logic here
        const snaps = await DraftService.getSnapshots(newDraft.id);
        setSnapshots(snaps);
      }
    }
    init();
  }, [user]);

  const isPasteRef = useRef(false);

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
       
       // computeScore expects Newest->Oldest (standard for getSnapshots) or generic list?
       // My implementation reverses it internally if needed, but let's check.
       // The service implementation: `const chronological = [...snapshots].reverse();`
       // This assumes `snapshots` passed to it are Newest First.
       // `allSnaps` here is [Newest, ...Older], so it is Newest First. Correct.
       
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
           // This prevents drift over time
           const [score, latestSnapshots] = await Promise.all([
            DraftService.calculateSovereigntyScore(draft.id),
            DraftService.getSnapshots(draft.id)
          ]);
          setSovereigntyScore(score);
          setSnapshots(latestSnapshots);
        }
      });
      
    setIsSaving(false);
  };

  // 2. Auto-Save Logic
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);

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

  const handlePaste = () => {
    isPasteRef.current = true;
  };

  const handleAttest = async () => {
    if (!draft) return;
    await AttestationService.generateCertificate(draft, snapshots, sovereigntyScore);
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
            className="p-1.5 sm:p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative"
            title="Version History"
            onClick={() => setShowHistory(!showHistory)}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 opacity-70" />
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
          <div className="w-full max-w-3xl py-12 px-8">
            <textarea
              className="w-full h-full min-h-[80vh] bg-transparent resize-none outline-none text-lg leading-relaxed placeholder-gray-300 dark:placeholder-gray-700"
              placeholder="Start drafting here to prove your process..."
              value={content}
              onChange={handleContentChange}
              onPaste={handlePaste}
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>

        {/* Sidebar: Version History (Simplified for MVP) */}
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

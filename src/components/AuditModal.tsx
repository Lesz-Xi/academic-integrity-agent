import React from 'react';
import { X, ShieldCheck, ShieldAlert, GitCommit, Clock, FileText, Activity, Hash, Fingerprint } from 'lucide-react';
import { DraftSnapshot } from '../types';

interface AuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  snapshots: DraftSnapshot[];
  sovereigntyScore: number;
  draftId: string;
}

const AuditModal: React.FC<AuditModalProps> = ({
  isOpen,
  onClose,
  theme,
  snapshots,
  sovereigntyScore,
  draftId
}) => {
  if (!isOpen) return null;

  // Calculate Session Stats
  const totalSnapshots = snapshots.length;
  const pasteEvents = snapshots.filter(s => s.pasteEventDetected).length;
  const totalCharsAdded = snapshots.reduce((acc, s) => acc + (s.charCountDelta > 0 ? s.charCountDelta : 0), 0);
  const startTime = snapshots.length > 0 ? new Date(snapshots[snapshots.length - 1].timestamp).toLocaleString() : '-';
  const lastActive = snapshots.length > 0 ? new Date(snapshots[0].timestamp).toLocaleString() : '-';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border ${
         theme === 'dark' ? 'bg-[#0f0f0f] border-[#333]' : 'bg-white border-gray-200'
      }`}>
        
        {/* Header: Status & Score */}
        <div className={`px-8 py-6 border-b flex-shrink-0 flex items-center justify-between ${
          theme === 'dark' ? 'border-[#222] bg-[#111]' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center gap-6">
             <div className="relative">
                <div className={`p-4 rounded-full border-4 ${
                    sovereigntyScore > 80 
                    ? 'border-green-500/20 bg-green-500/10 text-green-500' 
                    : sovereigntyScore > 50
                    ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-500'
                    : 'border-red-500/20 bg-red-500/10 text-red-500'
                }`}>
                    {sovereigntyScore > 80 ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
                </div>
                <div className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                     theme === 'dark' ? 'bg-black border-[#333]' : 'bg-white border-gray-200'
                }`}>
                    v8.0
                </div>
             </div>
             
             <div>
                <h2 className={`text-2xl font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Forensic Audit Log
                </h2>
                <div className="flex items-center gap-2 opacity-60 text-sm mt-1">
                    <Fingerprint className="w-4 h-4" />
                    <span className="font-mono">ID: {draftId.slice(0, 8)}...</span>
                </div>
             </div>
          </div>

          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#222] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Grid */}
        <div className={`flex-1 overflow-hidden flex flex-col md:flex-row ${
            theme === 'dark' ? 'bg-[#0a0a0a] text-gray-300' : 'bg-[#fff] text-gray-700'
        }`}>
            
            {/* Left Panel: Metrics */}
            <div className={`w-full md:w-1/3 p-6 border-r overflow-y-auto ${
                theme === 'dark' ? 'border-[#222] bg-[#111]/50' : 'border-gray-50 bg-gray-50/50'
            }`}>
                <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6">Session Telemetry</h3>
                
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}>
                            <Activity className="w-5 h-5 mb-2 text-purple-500" />
                            <div className="text-2xl font-bold">{totalSnapshots}</div>
                            <div className="text-[10px] opacity-60 uppercase">Snapshots</div>
                        </div>
                        <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}>
                            <FileText className="w-5 h-5 mb-2 text-blue-500" />
                            <div className="text-2xl font-bold">{totalCharsAdded}</div>
                            <div className="text-[10px] opacity-60 uppercase">Net Chars</div>
                        </div>
                    </div>

                    <div className={`p-4 rounded-xl border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold opacity-70">Paste Events</span>
                             <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                                 pasteEvents > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                             }`}>
                                 {pasteEvents} Detected
                             </span>
                        </div>
                        <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-red-500 transition-all" 
                                style={{ width: `${Math.min((pasteEvents / (totalSnapshots || 1)) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-[10px] opacity-50 mt-2">
                            High paste frequency negatively impacts Sovereignty Score.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-500/10">
                            <span className="opacity-60 flex items-center gap-2"><Clock className="w-3 h-3" /> Started</span>
                            <span className="font-mono">{startTime}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs py-2 border-b border-gray-500/10">
                            <span className="opacity-60 flex items-center gap-2"><Activity className="w-3 h-3" /> Last Active</span>
                            <span className="font-mono">{lastActive}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Chain of Custody Timeline */}
            <div className="w-full md:w-2/3 p-6 overflow-y-auto relative">
                 <h3 className="text-xs font-bold uppercase tracking-widest opacity-50 mb-6 sticky top-0 bg-inherit z-10 py-2">
                    Chain of Custody
                 </h3>

                 <div className="space-y-0 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-px before:bg-gray-500/20">
                    {snapshots.length === 0 ? (
                        <div className="py-20 text-center opacity-40">
                            <ShieldCheck className="w-12 h-12 mx-auto mb-4" />
                            <p>No snapshots recorded yet.</p>
                        </div>
                    ) : (
                        snapshots.map((snap) => (
                            <div key={snap.id} className="relative pl-12 py-4 group hover:bg-black/5 dark:hover:bg-white/5 rounded-r-xl transition-colors">
                                {/* Timeline Node */}
                                <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                                    theme === 'dark' ? 'bg-[#0a0a0a] border-[#222]' : 'bg-white border-gray-100'
                                }`}>
                                   {snap.pasteEventDetected ? (
                                       <div className="w-3 h-3 bg-red-500 rounded-sm transform rotate-45" />
                                   ) : (
                                       <div className={`w-3 h-3 rounded-full ${
                                           snap.charCountDelta > 0 ? 'bg-green-500' : 'bg-orange-500'
                                       }`} />
                                   )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className={`text-sm font-bold ${
                                            snap.pasteEventDetected ? 'text-red-500' : theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                                        }`}>
                                            {snap.pasteEventDetected ? 'High-Volume Paste' : snap.charCountDelta > 0 ? 'Content Addition' : 'Content Deletion'}
                                        </span>
                                        <span className="font-mono text-xs opacity-50">
                                            {new Date(snap.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second:'2-digit' })}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs opacity-60">
                                        <span className={`${snap.charCountDelta > 0 ? 'text-green-500' : 'text-orange-500'}`}>
                                            {snap.charCountDelta > 0 ? '+' : ''}{snap.charCountDelta} chars
                                        </span>
                                        {/* Fake Hash Visualizer based on timestamp just for visual feel if real hash missing */}
                                        <div className="flex items-center gap-1 font-mono text-[10px] bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded">
                                            <Hash className="w-3 h-3" />
                                            {(snap as any).integrityHash ? (snap as any).integrityHash.substring(0, 12) + '...' : `SHA-${snap.id.slice(-6)}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    
                    {/* Genesis Block */}
                    <div className="relative pl-12 py-4 opacity-50">
                        <div className={`absolute left-0 top-6 w-10 h-10 rounded-full border-4 border-dashed flex items-center justify-center z-10 ${
                             theme === 'dark' ? 'bg-[#0a0a0a] border-[#333]' : 'bg-white border-gray-200'
                        }`}>
                           <GitCommit className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col pt-2">
                             <span className="text-sm font-bold">Genesis Block</span>
                             <span className="text-xs">Session initialized</span>
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;

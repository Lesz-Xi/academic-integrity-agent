import React, { memo, useMemo } from 'react';
import { X, Clock, FileText, Code, RefreshCw } from 'lucide-react';
import { HistoryItem, Mode } from '../types';


interface HistoryPanelProps {
  history: HistoryItem[];
  activeMode: Mode;
  onDelete: (id: string) => void;
  onRestore: (item: HistoryItem) => void;
}

const getModeIcon = (mode: Mode) => {
  switch (mode) {
    case 'essay': return <FileText className="w-4 h-4" />;
    case 'cs': return <Code className="w-4 h-4" />;
    case 'paraphrase': return <RefreshCw className="w-4 h-4" />;
  }
};

const getModeLabel = (mode: Mode) => {
  switch (mode) {
    case 'essay': return 'Essay';
    case 'cs': return 'CS';
    case 'paraphrase': return 'Paraphrase';
  }
};

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, activeMode, onDelete, onRestore }) => {
  // Memoize filtered history to prevent recalculation on every render
  const filteredHistory = useMemo(
    () => history.filter(item => item.mode === activeMode),
    [history, activeMode]
  );

  if (filteredHistory.length === 0) {
    return null;
  }

  // Dynamic theme colors
  const containerClasses = "bg-white/5 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10 shadow-lg";

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 mb-4">
      <div className={`rounded-2xl p-4 border transition-colors duration-300 ${containerClasses}`}>
        
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 text-[#F2E8CF]`} />
            <h3 className={`text-sm font-semibold text-[#2D2D2D] dark:text-white uppercase tracking-wider opacity-90`}>
              Recent Generations
            </h3>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400`}>
              {filteredHistory.length}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10`}
              onClick={() => onRestore(item)}
            >
                {/* Mode Icon */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-[#FAF9F6] dark:bg-white/5 text-[#F2E8CF] transition-transform`}> 
                  {getModeIcon(item.mode)}
                </div>

                {/* Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400`}>
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600 text-[10px]">•</span>
                    <span className={`text-[10px] font-medium text-gray-400 dark:text-gray-500`}>
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm text-[#2D2D2D] dark:text-gray-200 truncate`}>
                    {item.input}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                      <div className={`flex-shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border ${
                      item.metrics.overallRisk === 'LOW' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' 
                        : item.metrics.overallRisk === 'MEDIUM'
                        ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                    }`}>
                      {item.metrics.overallRisk}
                    </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className={`p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400`}
                        title="Delete from history"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(HistoryPanel);

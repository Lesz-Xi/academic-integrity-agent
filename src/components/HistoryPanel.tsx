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
  // Dynamic theme colors
  const containerClasses = "bg-white/5 dark:bg-white/5 backdrop-blur-md border-white/20 dark:border-white/10 shadow-lg";
  const itemClasses = "bg-white/40 dark:bg-white/5 hover:bg-white/60 dark:hover:bg-white/10 border-white/20 dark:border-white/5 transition-all focus:outline-none focus:ring-2 focus:ring-[#F2E8CF]/50";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className={`gradient-border-container relative p-[1px] rounded-xl overflow-hidden`}>

         
         {/* Main Content Card */}
         <div className={`relative h-full rounded-xl p-3 border transition-colors duration-300 ${containerClasses}`}>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
             <Clock className={`w-5 h-5 text-[#F2E8CF]`} /> {/* Unified Brand Color */}
            <h3 className={`text-base font-bold text-[#2D2D2D] dark:text-white`}>
              Recent {getModeLabel(activeMode)} Generations
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400`}>
              {filteredHistory.length}
            </span>
          </div>
        </div>

        <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar p-1">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border shadow-sm hover:shadow-md ${itemClasses}`}
              onClick={() => onRestore(item)}
            >
              <div className="flex w-full items-center gap-4">
                {/* Mode Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-[#FAF9F6] dark:bg-yellow-400/10 text-[#F2E8CF] dark:text-yellow-400 border border-[#E5E3DD] dark:border-transparent transition-transform group-hover:scale-110`}> 
                  {getModeIcon(item.mode)}
                </div>

                {/* Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400`}>
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className={`text-xs font-medium text-gray-400 dark:text-gray-500`}>
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm font-medium text-[#2D2D2D] dark:text-gray-200 line-clamp-2 leading-relaxed`}>
                    {item.input}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                      <div className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-md border ${
                      item.metrics.overallRisk === 'LOW' 
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' 
                        : item.metrics.overallRisk === 'MEDIUM'
                        ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                    }`}>
                      {item.metrics.overallRisk}
                    </div>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(item.id);
                        }}
                        className={`p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-600 dark:hover:text-red-400`}
                        title="Delete from history"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                </div>
              </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
};

export default memo(HistoryPanel);

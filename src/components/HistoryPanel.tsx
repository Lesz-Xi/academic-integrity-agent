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
  const containerClasses = "bg-white dark:bg-[#2D2D2D] border-[#E5E3DD] dark:border-[#444]";
  const itemClasses = "bg-white/50 dark:bg-[#333] hover:bg-gray-50 dark:hover:bg-[#3d3d3d] border-[#E5E3DD] dark:border-[#444]";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
      <div className={`gradient-border-container relative p-[1px] rounded-xl overflow-hidden`}>
         {/* Circulating Light Animation Layer - Always Visible */}
         <div className={`absolute inset-[-50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,#D2B48C_360deg)] animate-spin-slow opacity-100`} />
         
         {/* Main Content Card */}
         <div className={`relative h-full rounded-xl p-3 border transition-colors duration-300 ${containerClasses}`}>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
             <Clock className={`w-5 h-5 text-[#D2B48C]`} /> {/* Unified Brand Color */}
            <h3 className={`text-base font-bold text-[#2D2D2D] dark:text-white`}>
              Recent {getModeLabel(activeMode)} Generations
            </h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono bg-gray-100 dark:bg-[#333] text-gray-500 dark:text-gray-400`}>
              {filteredHistory.length}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg cursor-pointer transition-all border ${itemClasses}`}
              onClick={() => onRestore(item)}
            >
              <div className="flex w-full items-center gap-4">
                {/* Mode Icon */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-[#FAF9F6] dark:bg-yellow-400/10 text-[#D2B48C] dark:text-yellow-400 border border-[#E5E3DD] dark:border-transparent`}> 
                  {getModeIcon(item.mode)}
                </div>

                {/* Content Preview */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400`}>
                      {getModeLabel(item.mode)}
                    </span>
                    <span className="text-gray-300 dark:text-gray-500">•</span>
                    <span className={`text-xs text-gray-400 dark:text-gray-500`}>
                      {formatTimestamp(item.timestamp)}
                    </span>
                  </div>
                  <p className={`text-sm truncate font-medium text-[#2D2D2D] dark:text-gray-200`}>
                    {item.input.substring(0, 80)}{item.input.length > 80 ? '...' : ''}
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

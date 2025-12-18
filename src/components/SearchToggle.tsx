import React from 'react';
import { Globe, SearchX } from 'lucide-react';
import { isSearchAvailable } from '../services/searchService';

interface SearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  theme: 'light' | 'dark';
  compact?: boolean;
}

const SearchToggle: React.FC<SearchToggleProps> = ({ enabled, onToggle, theme, compact = false }) => {
  const available = isSearchAvailable();

  if (!available) {
    if (compact) return null; // Don't show anything in compact mode if unavailable
    
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        theme === 'dark' ? 'bg-[#333] text-gray-500' : 'bg-gray-100 text-gray-400'
      }`}>
        <SearchX className="w-4 h-4" />
        <span>Search unavailable (no API key)</span>
      </div>
    );
  }

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-lg transition-all duration-200
      ${compact 
        ? 'px-2 py-1 border-transparent bg-transparent hover:bg-black/5 dark:hover:bg-white/5' 
        : `px-2 py-1.5 border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-200'}`
      }
    `}>
      {/* Left side: Icon + Label */}
      <div className="flex items-center gap-1.5">
        <Globe className={`
          ${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} 
          ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}
        `} strokeWidth={1.5} />
        <span className={`
          font-medium 
          ${compact ? 'text-[11px]' : 'text-xs'}
          ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}
        `}>
          Web Search
        </span>
      </div>
      
      {/* Right side: Toggle Switch */}
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none ${
          compact ? 'h-3.5 w-6' : 'h-4 w-7'
        } ${
          enabled
            ? 'bg-[#D2B48C]'
            : theme === 'dark'
              ? 'bg-[#444]'
              : 'bg-gray-300'
        }`}
        aria-label={enabled ? 'Disable web search' : 'Enable web search'}
      >
        <span
          className={`inline-block transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            compact ? 'h-2.5 w-2.5' : 'h-3 w-3'
          } ${
            enabled 
              ? (compact ? 'translate-x-3' : 'translate-x-3') 
              : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
};

export default SearchToggle;

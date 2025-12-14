import React from 'react';
import { Search, SearchX } from 'lucide-react';
import { isSearchAvailable } from '../services/searchService';

interface SearchToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  theme: 'light' | 'dark';
}

const SearchToggle: React.FC<SearchToggleProps> = ({ enabled, onToggle, theme }) => {
  const available = isSearchAvailable();

  if (!available) {
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
    <div className="flex items-center gap-3">
      <div className={`flex items-center gap-2 text-sm ${
        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        <Search className="w-4 h-4" />
        <span>Web Search</span>
      </div>
      
      <button
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          enabled
            ? 'bg-[#D2B48C] focus:ring-[#D2B48C]'
            : theme === 'dark'
              ? 'bg-[#444] focus:ring-gray-500'
              : 'bg-gray-300 focus:ring-gray-400'
        }`}
        aria-label={enabled ? 'Disable web search' : 'Enable web search'}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

      <span className={`text-xs px-2 py-1 rounded ${
        enabled
          ? 'bg-[#D2B48C]/20 text-[#D2B48C]'
          : theme === 'dark'
            ? 'bg-[#333] text-gray-500'
            : 'bg-gray-100 text-gray-400'
      }`}>
        {enabled ? 'ON' : 'OFF'}
      </span>

      {enabled && (
        <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          Sources will be cited in response
        </span>
      )}
    </div>
  );
};

export default SearchToggle;

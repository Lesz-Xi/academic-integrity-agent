import React, { memo } from 'react';
import { ModeConfig, Mode } from '../types';

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'essay',
    title: 'Essay & Research',
    icon: '📝',
    description: 'Generate original academic arguments with high semantic richness and varied structure',
    color: 'creme',
    promptFile: 'modeA_essay'
  },
  {
    id: 'cs',
    title: 'Computer Science',
    icon: '💻',
    description: 'Technical documentation with conversational tone in code explanations',
    color: 'charcoal',
    promptFile: 'modeB_cs'
  },
  {
    id: 'paraphrase',
    title: 'Paraphrase & Humanize',
    icon: '🔄',
    description: 'Restructure existing text with deep syntactic transformation',
    color: 'terracotta',
    promptFile: 'modeC_paraphrase'
  }
];

interface ModeSelectorProps {
  selectedMode: Mode | null;
  onSelectMode: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const getColorClasses = (mode: ModeConfig, isSelected: boolean) => {
    // These need to look good in both light and dark mode
    switch (mode.color) {
      case 'terracotta':
        return isSelected 
          ? 'bg-[#CC785C] border-[#CC785C] text-white shadow-lg scale-105' 
          : 'bg-white dark:bg-[#252525] border-[#E5E3DD] dark:border-[#444] text-[#2D2D2D] dark:text-[#e5e5e5] hover:border-[#CC785C] dark:hover:border-[#CC785C] hover:shadow-md';
      case 'charcoal':
        return isSelected 
          ? 'bg-[#2D2D2D] dark:bg-[#404040] border-[#2D2D2D] dark:border-[#404040] text-white shadow-lg scale-105' 
          : 'bg-white dark:bg-[#252525] border-[#E5E3DD] dark:border-[#444] text-[#2D2D2D] dark:text-[#e5e5e5] hover:border-[#2D2D2D] dark:hover:border-[#999] hover:shadow-md';
      case 'creme':
        return isSelected 
          ? 'bg-[#D2B48C] border-[#D2B48C] text-[#2D2D2D] shadow-lg scale-105' 
          : 'bg-white dark:bg-[#252525] border-[#E5E3DD] dark:border-[#444] text-[#2D2D2D] dark:text-[#e5e5e5] hover:border-[#D2B48C] dark:hover:border-[#C1A87D] hover:shadow-md';
      default:
        return 'bg-white dark:bg-[#252525] border-[#E5E3DD] dark:border-[#444]';
    }
  };

  return (
    <div id="mode-selector" className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-[#2D2D2D] dark:text-white mb-3">Select Writing Mode</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Choose a specialized generation mode tailored for specific academic contexts and anti-detection strategies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {MODE_CONFIGS.map((mode) => {
          const isSelected = selectedMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onSelectMode(mode.id)}
              aria-label={`Select ${mode.title} mode: ${mode.description}`}
              aria-pressed={isSelected}
              className={`p-8 rounded-xl border-2 transition-all duration-300 transform text-left ${getColorClasses(mode, isSelected)}`}
            >
              <div className="text-5xl mb-6">{mode.icon}</div>
              <h3 className="text-xl font-bold mb-3">{mode.title}</h3>
              <p className={`text-sm leading-relaxed ${isSelected ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                {mode.description}
              </p>
              
              {isSelected && (
                <div className="mt-6 pt-6 border-t border-white/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Active Mode</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {selectedMode && (
        <div className={`mt-8 p-4 rounded-xl border flex items-center gap-3 transition-colors ${
        selectedMode 
          ? 'bg-[#FAF9F6] border-[#D2B48C] text-[#2D2D2D]' 
          : 'bg-gray-50 border-gray-200 text-gray-500'
      }`}>
          <p className="text-sm">
            <strong>Mode selected:</strong> {MODE_CONFIGS.find(m => m.id === selectedMode)?.title}. 
            Scroll down to enter your topic or text.
          </p>
        </div>
      )}
    </div>
  );
};

export default memo(ModeSelector);

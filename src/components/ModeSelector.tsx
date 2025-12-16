import React, { memo } from 'react';
import { Terminal, RefreshCw, Feather } from 'lucide-react';
import { ModeConfig, Mode } from '../types';

const MODE_CONFIGS: ModeConfig[] = [
  {
    id: 'essay',
    title: 'Essay & Research',
    icon: (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F2E8CF] to-[#C19A6B] flex items-center justify-center shadow-lg border border-[#F2E8CF]/30 group-hover:scale-110 transition-transform duration-300">
        <Feather className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    ),
    description: 'Generate original academic arguments with high semantic richness and varied structure. Specify focus or tone in Additional Instructions.',
    color: 'creme',
    promptFile: 'modeA_essay'
  },
  {
    id: 'cs',
    title: 'Computer Science',
    icon: (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg border border-gray-600/30 group-hover:scale-110 transition-transform duration-300">
        <Terminal className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    ),
    description: 'Technical documentation with conversational tone in code explanations. Specify languages or frameworks in Additional Instructions.',
    color: 'charcoal',
    promptFile: 'modeB_cs'
  },
  {
    id: 'paraphrase',
    title: 'Paraphrase & Humanize',
    icon: (
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E69F88] to-[#CE796B] flex items-center justify-center shadow-lg border border-[#E69F88]/30 group-hover:scale-110 transition-transform duration-300">
        <RefreshCw className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
    ),
    description: 'Restructure existing text with deep syntactic transformation. Use Additional Instructions for summarization or custom rewrites.',
    color: 'terracotta',
    promptFile: 'modeC_paraphrase'
  }
];

interface ModeSelectorProps {
  selectedMode: Mode | null;
  onSelectMode: (mode: Mode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ selectedMode, onSelectMode }) => {
  const getColorClasses = (isSelected: boolean) => {
    // These need to look good in both light and dark mode
    // Active style is always Creme (#F2E8CF) as requested
    if (isSelected) {
      return 'bg-[#F2E8CF] border-[#F2E8CF] text-[#2D2D2D] shadow-lg scale-105';
    }

    // Glassmorphism style for unselected cards
    return 'bg-white/5 dark:bg-white/5 backdrop-blur-md border border-black/5 dark:border-white/10 text-[#2D2D2D] dark:text-gray-200 hover:border-[#F2E8CF] dark:hover:border-[#F2E8CF] hover:shadow-xl hover:bg-white/10 dark:hover:bg-white/10';
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
              className={`relative p-6 rounded-2xl border-2 transition-all duration-200 ease-out transform text-left active:scale-95 ${getColorClasses(isSelected)}`}
            >
              <div className="mb-4">{mode.icon}</div>
              <h3 className="text-lg font-bold mb-2">{mode.title}</h3>
              <p className={`text-sm leading-relaxed ${isSelected ? 'text-[#2D2D2D]/90' : 'text-gray-500 dark:text-gray-400'}`}>
                {mode.description}
              </p>
              
              {isSelected && (
                <div className="mt-6 pt-6 border-t border-[#2D2D2D]/20 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span className="text-xs font-semibold uppercase tracking-widest">Active Mode</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(ModeSelector);

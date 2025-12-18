import React, { memo } from 'react';
import { EssayLength, LengthConfig } from '../types';

const LENGTH_CONFIGS: LengthConfig[] = [
  {
    id: 'short',
    label: 'Normal',
    wordRange: '400-500',
    targetWords: 450,
    description: 'Quick responses, focused content'
  },
  {
    id: 'medium',
    label: 'Medium',
    wordRange: '1,000-1,500',
    targetWords: 1250,
    description: 'Standard essays, detailed analysis'
  },
  {
    id: 'long',
    label: 'Long',
    wordRange: '2,000-3,000',
    targetWords: 2500,
    description: 'Deep research, comprehensive papers'
  }
];

interface LengthSelectorProps {
  selectedLength: EssayLength;
  onSelectLength: (length: EssayLength) => void;
}

const LengthSelector: React.FC<LengthSelectorProps> = ({ selectedLength, onSelectLength }) => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-[#2D2D2D] dark:text-white mb-1">Essay Length</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Choose your target word count</p>
      </div>
      
      <div className="flex gap-3 justify-center">
        {LENGTH_CONFIGS.map((config) => {
          const isSelected = selectedLength === config.id;
          return (
            <button
              key={config.id}
              onClick={() => onSelectLength(config.id)}
              className={`group relative px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-[#F2E8CF] text-[#2D2D2D] shadow-lg scale-105'
                  : 'bg-white/5 dark:bg-white/5 backdrop-blur-md text-[#2D2D2D] dark:text-gray-200 border border-black/5 dark:border-white/10 hover:border-[#F2E8CF] dark:hover:border-[#F2E8CF] hover:shadow-lg hover:bg-white/10 dark:hover:bg-white/10'
              }`}
            >
              <div className="text-center">
                <div className="font-bold">{config.label}</div>
                <div className={`text-xs ${isSelected ? 'text-[#2D2D2D]/80' : 'text-gray-500 dark:text-gray-400'}`}>
                  {config.wordRange} words
                </div>
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {config.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default memo(LengthSelector);

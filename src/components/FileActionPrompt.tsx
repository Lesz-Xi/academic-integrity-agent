/**
 * FileActionPrompt Component
 * Shows quick-action buttons after file upload to help students choose the right operation
 */

import React from 'react';
import { RefreshCw, PenLine, Scissors, Settings, FileText, BookOpen, XCircle, Shuffle } from 'lucide-react';
import { ContentAnalysis, getContentTypeLabel } from '../utils/contentAnalyzer';
import { Mode } from '../types';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  mode: Mode | null;  // null means "keep current mode"
  instruction: string;
  color: string;
}

interface FileActionPromptProps {
  fileName: string;
  analysis: ContentAnalysis;
  onActionSelect: (mode: Mode | null, instruction: string, actionId: string) => void;
  onDismiss: () => void;
  theme?: 'light' | 'dark';
}

const quickActions: QuickAction[] = [
  {
    id: 'humanize',
    label: 'Humanize',
    icon: <RefreshCw className="w-4 h-4" />,
    description: 'Rewrite to sound more natural',
    mode: 'paraphrase',
    instruction: 'Rewrite this content to sound more natural and human-written while preserving the original meaning and all citations.',
    color: 'from-[#F2E8CF] to-[#D2B48C]',
  },
  {
    id: 'expand',
    label: 'Expand',
    icon: <PenLine className="w-4 h-4" />,
    description: 'Add more depth and analysis',
    mode: 'essay',
    instruction: 'Expand on the key arguments and add more analytical depth. Keep the same thesis and structure.',
    color: 'from-[#F2E8CF] to-[#D2B48C]',
  },
  {
    id: 'shorten',
    label: 'Shorten',
    icon: <Scissors className="w-4 h-4" />,
    description: 'Summarize to fewer words',
    mode: 'paraphrase',
    instruction: 'Condense this content to approximately 50% of its length while keeping all key points and citations.',
    color: 'from-[#F2E8CF] to-[#D2B48C]',
  },
  {
    id: 'paraphrase',
    label: 'Paraphrase',
    icon: <Shuffle className="w-4 h-4" />,
    description: 'Restructure with new wording',
    mode: 'paraphrase',
    instruction: 'Restructure this text with different sentence structures and vocabulary while preserving the original meaning and all citations.',
    color: 'from-[#F2E8CF] to-[#D2B48C]',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: <Settings className="w-4 h-4" />,
    description: 'Write your own instructions',
    mode: null,  // Keep current mode
    instruction: '',
    color: 'from-[#F2E8CF] to-[#D2B48C]',
  },
];

const FileActionPrompt: React.FC<FileActionPromptProps> = ({
  fileName,
  analysis,
  onActionSelect,
  onDismiss,
  theme = 'dark',
}) => {
  const contentTypeLabel = getContentTypeLabel(analysis.contentType);
  
  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <div className={`mt-4 rounded-2xl border overflow-hidden transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
      theme === 'dark' 
        ? 'bg-[#1E1E1E] border-white/10' 
        : 'bg-white border-gray-200 shadow-lg'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex items-center justify-between ${
        theme === 'dark' ? 'border-white/10' : 'border-gray-100'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            theme === 'dark' ? 'bg-white/10' : 'bg-gray-100'
          }`}>
            <FileText className={`w-4 h-4 ${
              theme === 'dark' ? 'text-[#D2B48C]' : 'text-[#CC785C]'
            }`} />
          </div>
          <div>
            <p className={`font-medium truncate max-w-[200px] ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              {fileName}
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {contentTypeLabel} • {formatNumber(analysis.wordCount)} words
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className={`p-1.5 rounded-lg transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-white/10 text-gray-400' 
              : 'hover:bg-gray-100 text-gray-500'
          }`}
          title="Dismiss"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>

      {/* Citation badge */}
      {/* Citation badge */}
      {analysis.citationCount > 0 && (
        <div className={`px-4 py-2 flex items-center gap-2 border-b ${
          theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-gray-100 bg-gray-50'
        }`}>
          <BookOpen className={`w-3.5 h-3.5 ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`} />
          <span className={`text-xs ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {analysis.citationCount} citation{analysis.citationCount > 1 ? 's' : ''} detected
            {analysis.citationStyle !== 'None' && analysis.citationStyle !== 'Unknown' && 
              ` (${analysis.citationStyle} format)`
            }
            {' '}— will be preserved
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="p-4">
        <p className={`text-sm font-medium mb-3 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          What would you like to do?
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onActionSelect(action.mode, action.instruction, action.id)}
              className={`group relative p-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                theme === 'dark'
                  ? 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center text-[#2D2D2D] mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
                {action.icon}
              </div>
              <p className={`text-sm font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {action.label}
              </p>
              <p className={`text-[10px] leading-tight mt-0.5 ${
                theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                {action.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileActionPrompt;

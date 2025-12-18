/**
 * FileAnalysisCard Component
 * Displays document analysis results with smart action buttons
 */

import React, { useState } from 'react';
import { FileAnalysis } from '../services/fileAnalyzer';
import { DOCUMENT_TYPE_LABELS, DOCUMENT_TYPE_COLORS } from '../prompts/fileAnalysisPrompt';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Beaker, 
  Users, 
  BarChart3,
  Sparkles,
  Loader2
} from 'lucide-react';

interface FileAnalysisCardProps {
  analysis: FileAnalysis;
  isLoading?: boolean;
  onActionSelect: (action: string) => void;
  theme?: 'light' | 'dark';
}

const FileAnalysisCard: React.FC<FileAnalysisCardProps> = ({
  analysis,
  isLoading = false,
  onActionSelect,
  theme = 'dark'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const typeLabel = DOCUMENT_TYPE_LABELS[analysis.documentType] || '📄 Document';
  const typeColor = DOCUMENT_TYPE_COLORS[analysis.documentType] || DOCUMENT_TYPE_COLORS.unknown;
  
  const isDark = theme === 'dark';
  
  // Get methodology icon
  const getMethodologyIcon = () => {
    switch (analysis.documentType) {
      case 'quantitative_research':
        return <BarChart3 className="w-3.5 h-3.5" />;
      case 'qualitative_research':
        return <Users className="w-3.5 h-3.5" />;
      case 'mixed_methods':
        return <Beaker className="w-3.5 h-3.5" />;
      default:
        return <FileText className="w-3.5 h-3.5" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className={`mt-3 p-3 rounded-xl border ${
        isDark ? 'bg-[#252525] border-white/10' : 'bg-gray-50 border-gray-200'
      } animate-pulse`}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#C1A87D]" />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Analyzing document...
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`mt-3 rounded-xl border overflow-hidden transition-all ${
      isDark ? 'bg-[#252525] border-white/10' : 'bg-gray-50 border-gray-200'
    }`}>
      {/* Header - Always visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Document Type Badge */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${typeColor}`}>
              {getMethodologyIcon()}
              {typeLabel}
            </span>
            
            {/* Confidence */}
            {analysis.confidence > 0 && (
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {Math.round(analysis.confidence * 100)}% confidence
              </span>
            )}
          </div>
          
          <button className={`p-1 rounded ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        {/* Summary - Always visible */}
        <p className={`mt-2 text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {analysis.summary}
        </p>
      </div>
      
      {/* Expanded Details */}
      {isExpanded && (
        <div className={`px-3 pb-3 border-t ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
          {/* Structure Pills */}
          {analysis.structure.estimatedSections.length > 0 && (
            <div className="mt-3">
              <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Structure
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {analysis.structure.estimatedSections.slice(0, 6).map((section, idx) => (
                  <span 
                    key={idx}
                    className={`px-2 py-0.5 rounded text-xs ${
                      isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Research Indicators */}
          {analysis.researchIndicators && (
            <div className="mt-3 space-y-2">
              {analysis.researchIndicators.methodology && (
                <div className="flex items-center gap-2">
                  <Beaker className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Methodology: {analysis.researchIndicators.methodology}
                  </span>
                </div>
              )}
              
              {analysis.researchIndicators.sampleSize && (
                <div className="flex items-center gap-2">
                  <Users className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Sample: {analysis.researchIndicators.sampleSize}
                  </span>
                </div>
              )}
              
              {analysis.researchIndicators.keyFindings.length > 0 && (
                <div className="mt-2">
                  <span className={`text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Key Findings
                  </span>
                  <ul className="mt-1 space-y-1">
                    {analysis.researchIndicators.keyFindings.slice(0, 3).map((finding, idx) => (
                      <li 
                        key={idx}
                        className={`text-xs pl-3 border-l-2 ${
                          isDark ? 'text-gray-400 border-[#C1A87D]/50' : 'text-gray-600 border-amber-400'
                        }`}
                      >
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons - Always visible */}
      <div className={`p-3 border-t ${isDark ? 'border-white/5 bg-black/20' : 'border-gray-200 bg-gray-100'}`}>
        <div className="flex flex-wrap gap-2">
          {analysis.suggestedActions.slice(0, 4).map((action, idx) => (
            <button
              key={idx}
              onClick={() => onActionSelect(action)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                idx === 0 
                  ? 'bg-[#C1A87D] text-black hover:bg-[#D4BC91]' 
                  : isDark 
                    ? 'bg-white/10 text-gray-300 hover:bg-white/20' 
                    : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
              }`}
            >
              {idx === 0 && <Sparkles className="w-3 h-3" />}
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FileAnalysisCard;

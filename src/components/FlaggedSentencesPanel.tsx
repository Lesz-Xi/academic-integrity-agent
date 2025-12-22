import React, { useState } from 'react';
import { HumanEditFlag } from '../types';
import { AlertTriangle, ChevronDown, ChevronUp, Lightbulb, Edit3 } from 'lucide-react';

interface FlaggedSentencesPanelProps {
  flags: HumanEditFlag[] | undefined;
  stats: { totalSentences: number; highRisk: number; mediumRisk: number; lowRisk: number } | undefined;
}

const FlaggedSentencesPanel: React.FC<FlaggedSentencesPanelProps> = ({ flags, stats }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!flags || flags.length === 0) {
    return null;
  }

  const highRiskFlags = flags.filter(f => f.riskLevel === 'HIGH');
  const mediumRiskFlags = flags.filter(f => f.riskLevel === 'MEDIUM');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0 mt-6">
      <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-xl border border-orange-500/30 dark:border-orange-500/20 overflow-hidden">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-6 py-4 flex items-center justify-between bg-orange-500/10 dark:bg-orange-900/20 hover:bg-orange-500/15 dark:hover:bg-orange-900/25 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Edit3 className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-orange-600 dark:text-orange-400">
              Human Review Recommended
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {stats && (
              <div className="flex items-center gap-2 text-xs">
                {highRiskFlags.length > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-600 dark:text-red-400 rounded-full font-medium">
                    {highRiskFlags.length} High
                  </span>
                )}
                {mediumRiskFlags.length > 0 && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full font-medium">
                    {mediumRiskFlags.length} Medium
                  </span>
                )}
              </div>
            )}
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            )}
          </div>
        </button>

        {/* Content */}
        {isExpanded && (
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              The following sentences may trigger GPTZero detection. Consider rewriting them manually:
            </p>

            {flags.map((flag, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  flag.riskLevel === 'HIGH'
                    ? 'bg-red-500/5 dark:bg-red-900/10 border-red-500/30'
                    : 'bg-yellow-500/5 dark:bg-yellow-900/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                      flag.riskLevel === 'HIGH'
                        ? 'text-red-500 dark:text-red-400'
                        : 'text-yellow-500 dark:text-yellow-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          flag.riskLevel === 'HIGH'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                            : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                        }`}
                      >
                        {flag.riskLevel} RISK
                      </span>
                      <span className="text-xs text-gray-500">Sentence #{flag.index + 1}</span>
                    </div>
                    
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                      "{flag.sentence.length > 200 ? flag.sentence.substring(0, 200) + '...' : flag.sentence}"
                    </p>

                    {/* Issues */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {flag.issues.map((issue, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {issue}
                        </span>
                      ))}
                    </div>

                    {/* Suggestion */}
                    {flag.suggestion && (
                      <div className="flex items-start gap-2 p-3 bg-blue-500/5 dark:bg-blue-900/10 rounded-lg border border-blue-500/20">
                        <Lightbulb className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <strong>Suggestion:</strong> {flag.suggestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Stats Summary */}
            {stats && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Total sentences analyzed: {stats.totalSentences}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      {stats.lowRisk} safe
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                      {stats.mediumRisk} review
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      {stats.highRisk} edit
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(FlaggedSentencesPanel);

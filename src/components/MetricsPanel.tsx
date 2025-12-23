import React, { useState } from 'react';
import { DetectionMetrics } from '../types';
import { Activity, HelpCircle } from 'lucide-react';
import DetectionExplainer from './DetectionExplainer';

interface MetricsPanelProps {
  metrics: DetectionMetrics | null;
  theme?: 'light' | 'dark';
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, theme = 'light' }) => {
  const [showExplainer, setShowExplainer] = useState(false);
  // Calculate histogram data from sentence lengths
  // Histogram data removed to save vertical space as requested

  if (!metrics) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 p-8 text-center transition-colors shadow-lg">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">Metrics will appear here after content generation</p>
        </div>
      </div>
    );
  }

  // Helper function to determine risk color classes
  const getRiskColor = () => {
    const risk = metrics.overallRisk;
    switch (risk) {
      case 'LOW':
        return 'bg-[#F2E8CF]/10 dark:bg-[#F2E8CF]/5 border-[#85683F]/20 dark:border-[#85683F]/10 text-[#85683F]/80 dark:text-[#F2E8CF]/70';
      case 'MEDIUM':
        return 'bg-[#F2E8CF]/20 dark:bg-[#F2E8CF]/5 border-[#85683F]/30 dark:border-[#85683F]/20 text-[#85683F] dark:text-[#F2E8CF]';
      case 'HIGH':
        return 'bg-red-500/10 dark:bg-red-900/10 border-red-500/30 dark:border-red-500/20 text-red-700 dark:text-red-400';
      default:
        return 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400';
    }
  };

  // Helper function to get risk interpretation text
  const getRiskText = () => {
    const risk = metrics.overallRisk;
    switch (risk) {
      case 'LOW': return 'The content exhibits characteristics commonly found in human-generated text, with high burstiness and perplexity. It is unlikely to be detected as AI-generated.';
      case 'MEDIUM': return 'The content shows some signs of AI generation, such as lower burstiness or perplexity. It might be detected by advanced AI detection tools.';
      case 'HIGH': return 'The content strongly resembles AI-generated text, with low burstiness and perplexity. It is highly likely to be detected as AI-generated.';
      default: return 'Unable to determine risk interpretation.';
    }
  };



  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <div className="bg-transparent p-0 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#C1A87D]" />
            Integrity Metrics
          </h3>
          <button
            onClick={() => setShowExplainer(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-[#C1A87D] hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            title="Learn about detection scores"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>What does this mean?</span>
          </button>
        </div>

        {/* Overall Risk Card */}
        <div className={`mb-10 p-6 rounded-2xl border transition-all ${getRiskColor()} shadow-sm hover:shadow-md duration-300`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-50">Risk Profile</h4>
            <span className="text-lg font-bold text-[#C1A87D] dark:text-[#f2e8cf] tracking-wide">{metrics.overallRisk.toUpperCase()}</span>
          </div>
          <p className="opacity-90 text-sm leading-loose font-medium max-w-2xl">{getRiskText()}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
          {/* Burstiness Metric */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Burstiness</span>
              <span className={`text-sm font-bold text-[#C1A87D] dark:text-[#f2e8cf]`}>
                {metrics.burstiness.score}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.burstiness.score !== 'LOW' ? 'bg-[#C1A87D] dark:bg-[#f2e8cf]' : 'bg-[#85683F]/60'}`}
                style={{ width: `${Math.min(metrics.burstiness.coefficient_of_variation * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              CV: {metrics.burstiness.coefficient_of_variation.toFixed(2)} (Target: &gt; 0.6)
            </p>
          </div>

          {/* Perplexity Metric */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Perplexity</span>
              <span className={`text-sm font-bold text-[#C1A87D] dark:text-[#f2e8cf]`}>
                {metrics.perplexity.score}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.perplexity.score !== 'LOW' ? 'bg-[#C1A87D] dark:bg-[#f2e8cf]' : 'bg-[#85683F]/60'}`}
                style={{ width: `${Math.min((metrics.perplexity.perplexity / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              Score: {metrics.perplexity.perplexity.toFixed(1)} (Target: &gt; 100)
            </p>
          </div>
        </div>


      </div>

      {/* Detection Explainer - Inline Toggle */}
      <DetectionExplainer
        isOpen={showExplainer}
        onClose={() => setShowExplainer(false)}
        theme={theme}
        currentScore={metrics.overallRisk}
        mode="inline"
      />
    </div>
  );
};

export default React.memo(MetricsPanel);

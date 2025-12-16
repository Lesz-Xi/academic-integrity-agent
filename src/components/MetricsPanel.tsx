import React from 'react';
import { DetectionMetrics } from '../types';
import { Activity } from 'lucide-react';

interface MetricsPanelProps {
  metrics: DetectionMetrics | null;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
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
      case 'LOW': return 'text-[#2D2D2D] bg-[#F5F3EE] border-[#F2E8CF] dark:text-[#E5E5E5] dark:bg-[#3A332A] dark:border-[#F2E8CF]';
      case 'MEDIUM': return 'text-[#2D2D2D] bg-[#F2E8CF] border-[#F2E8CF] dark:text-[#E5E5E5] dark:bg-[#F2E8CF]/20 dark:border-[#F2E8CF]';
      case 'HIGH': return 'text-[#f2e8cf] bg-red-900/80 border-[#f2e8cf]/50 dark:text-[#f2e8cf] dark:bg-red-900/30 dark:border-[#f2e8cf]';
      default: return 'text-gray-600 bg-gray-50 border-gray-200 dark:text-gray-400 dark:bg-gray-900/30 dark:border-gray-700';
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
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
      <div className="bg-white/5 dark:bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-lg mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#2D2D2D] dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#F2E8CF]" />
          Anti-Detection Metrics
        </h3>
        </div>

        {/* Overall Risk Card */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${getRiskColor()} transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold">Overall Detection Risk</h4>
            <span className="text-2xl font-bold">{metrics.overallRisk.toUpperCase()}</span>
          </div>
          <p className="opacity-90">{getRiskText()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Burstiness Metric */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Burstiness (Sentence Variance)</span>
              <span className={`font-bold text-[#C1A87D] dark:text-[#f2e8cf]`}>
                {metrics.burstiness.score}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.burstiness.score !== 'LOW' ? 'bg-[#C1A87D] dark:bg-[#f2e8cf]' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min(metrics.burstiness.coefficient_of_variation * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              CV: {metrics.burstiness.coefficient_of_variation.toFixed(2)} (Target: &gt; 0.6)
            </p>
          </div>

          {/* Perplexity Metric */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Perplexity (Unpredictability)</span>
              <span className={`font-bold text-[#C1A87D] dark:text-[#f2e8cf]`}>
                {metrics.perplexity.score}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.perplexity.score !== 'LOW' ? 'bg-[#C1A87D] dark:bg-[#f2e8cf]' : 'bg-yellow-500'}`}
                style={{ width: `${Math.min((metrics.perplexity.perplexity / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Score: {metrics.perplexity.perplexity.toFixed(1)} (Target: &gt; 100)
            </p>
          </div>
        </div>


      </div>
    </div>
  );
};

export default React.memo(MetricsPanel);

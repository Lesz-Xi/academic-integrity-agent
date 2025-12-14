import React, { useMemo } from 'react';
import { DetectionMetrics } from '../types';
import { Activity } from 'lucide-react';

interface MetricsPanelProps {
  metrics: DetectionMetrics | null;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  // Calculate histogram data from sentence lengths
  const histogramData = useMemo(() => {
    if (!metrics?.burstiness.sentence_lengths) return [];
    
    const lengths = metrics.burstiness.sentence_lengths;
    const bins = [
      { label: 'Short', max: 10, count: 0 },
      { label: 'Medium', max: 25, count: 0 },
      { label: 'Long', max: 999, count: 0 }
    ];
    
    lengths.forEach(len => {
      if (len <= 10) bins[0].count++;
      else if (len <= 25) bins[1].count++;
      else bins[2].count++;
    });
    
    return bins.map(b => ({ range: b.label, count: b.count }));
  }, [metrics]);

  if (!metrics) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 dark:bg-[#252525] rounded-xl border-2 border-gray-200 dark:border-[#444] p-8 text-center transition-colors">
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
      case 'LOW': return 'text-[#2D2D2D] bg-[#F5F3EE] border-[#D2B48C] dark:text-[#E5E5E5] dark:bg-[#3A332A] dark:border-[#D2B48C]';
      case 'MEDIUM': return 'text-[#f2e8cf] bg-yellow-900/80 border-[#f2e8cf]/50 dark:text-[#f2e8cf] dark:bg-yellow-900/30 dark:border-[#f2e8cf]'; // Updated to #f2e8cf
      case 'HIGH': return 'text-[#f2e8cf] bg-red-900/80 border-[#f2e8cf]/50 dark:text-[#f2e8cf] dark:bg-red-900/30 dark:border-[#f2e8cf]';    // Updated to #f2e8cf
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

  const maxCount = histogramData.length > 0
    ? Math.max(...histogramData.map(item => item.count))
    : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-[#252525] rounded-xl border border-[#E5E3DD] dark:border-[#444] shadow-sm p-6 transition-colors duration-300">
        <h3 className="text-xl font-bold text-[#2D2D2D] dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#D2B48C]" />
          Anti-Detection Metrics
        </h3>

        {/* Overall Risk Card */}
        <div className={`mb-8 p-6 rounded-xl border-2 ${getRiskColor()} transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-bold">Overall Detection Risk</h4>
            <span className="text-2xl font-bold text-[#f2e8cf]">{metrics.overallRisk.toUpperCase()}</span> {/* Color updated */}
          </div>
          <p className="opacity-90">{getRiskText()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Burstiness Metric */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-600 dark:text-gray-300">Burstiness (Sentence Variance)</span>
              <span className={`font-bold ${metrics.burstiness.score === 'HIGH' ? 'text-[#f2e8cf]' : 'text-[#f2e8cf]'}`}> {/* Color updated */}
                {metrics.burstiness.score}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.burstiness.score !== 'LOW' ? 'bg-[#f2e8cf]' : 'bg-yellow-500'}`} // Updated to match Perplexity
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
              <span className={`font-bold text-[#f2e8cf]`}>
                {metrics.perplexity.score}
              </span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${metrics.perplexity.score !== 'LOW' ? 'bg-[#f2e8cf]' : 'bg-yellow-500'}`} // Consistent matching color
                style={{ width: `${Math.min((metrics.perplexity.perplexity / 300) * 100, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Score: {metrics.perplexity.perplexity.toFixed(1)} (Target: &gt; 100)
            </p>
          </div>
        </div>

        {/* Histogram */}
        <div>
          <h4 className="font-semibold text-[#2D2D2D] dark:text-gray-200 mb-4 text-sm">Sentence Length Distribution</h4>
          <div className="h-32 flex items-end gap-1 border-b border-gray-200 dark:border-gray-700 pb-2">
            {histogramData.map((item, idx) => {
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="w-full bg-[#D2B48C] opacity-80 hover:opacity-100 transition-all rounded-t-sm"
                    style={{ height: `${height}%` }}
                  ></div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-10 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.range}: {item.count} sentences
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Short (0-10)</span>
            <span>Medium (11-25)</span>
            <span>Long (25+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MetricsPanel);

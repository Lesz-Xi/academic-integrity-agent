import React, { useState } from 'react';
import { X, Info, AlertTriangle, TrendingUp, HelpCircle } from 'lucide-react';

interface DetectionExplainerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  currentScore?: 'LOW' | 'MEDIUM' | 'HIGH';
  mode?: 'modal' | 'inline';
}

const DetectionExplainer: React.FC<DetectionExplainerProps> = ({ 
  isOpen, 
  onClose, 
  theme,
  currentScore,
  mode = 'modal'
}) => {
  const [activeTab, setActiveTab] = useState<'understand' | 'limitations' | 'defend'>('understand');

  if (!isOpen) return null;

  const content = (
    <div className={`relative w-full ${mode === 'modal' ? 'max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all' : 'rounded-2xl border mt-4'} ${
      theme === 'dark' 
        ? mode === 'modal' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'bg-[#1e1e1e] border-[#333] text-gray-200'
        : mode === 'modal' ? 'bg-white text-gray-900 border border-gray-100' : 'bg-gray-50 border-gray-200 text-gray-800'
    }`}>
      
      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${
        theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-100 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
             theme === 'dark' ? 'bg-[#333]' : 'bg-white shadow-sm'
          }`}>
            <HelpCircle className="w-5 h-5 text-[#C1A87D]" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Understanding AI Detection</h3>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              What these scores really mean
            </p>
          </div>
        </div>
        {mode === 'modal' && (
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className={`flex border-b ${theme === 'dark' ? 'border-[#333]' : 'border-gray-100'}`}>
        {[
          { id: 'understand', label: 'Scores', icon: Info },
          { id: 'limitations', label: 'Limitations', icon: AlertTriangle },
          { id: 'defend', label: 'Defense', icon: TrendingUp },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              activeTab === tab.id
                ? theme === 'dark' 
                  ? 'text-[#C1A87D] border-b-2 border-[#C1A87D] bg-[#C1A87D]/5'
                  : 'text-[#C1A87D] border-b-2 border-[#C1A87D] bg-[#C1A87D]/5'
                : theme === 'dark'
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`p-6 ${mode === 'modal' ? 'max-h-[60vh] overflow-y-auto' : ''} ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          
          {activeTab === 'understand' && (
            <div className="space-y-6">
              <div>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  What is AI Detection?
                </h4>
                <p className="text-sm leading-relaxed">
                  AI detectors analyze statistical patterns in text, primarily <strong>perplexity</strong> (how 
                  predictable word choices are) and <strong>burstiness</strong> (variation in sentence length). 
                  They are <strong>probabilistic models</strong>, not definitive truth detectors.
                </p>
              </div>

              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}>
                <h5 className="font-bold text-sm mb-3">Score Interpretation</h5>
                <div className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <span className="w-20 font-medium text-green-600 dark:text-green-400">LOW Risk</span>
                    <span>High variation, unpredictable patterns. Less likely to be flagged.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 font-medium text-[#C1A87D]">MEDIUM</span>
                    <span>Some regular patterns detected. May trigger review but not conclusive.</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="w-20 font-medium text-red-500">HIGH Risk</span>
                    <span>Highly uniform patterns. Likely to be flagged, but <strong>not proof</strong> of AI use.</span>
                  </div>
                </div>
              </div>

              {currentScore && (
                <div className={`p-4 rounded-xl border ${
                  currentScore === 'LOW' ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' :
                  currentScore === 'MEDIUM' ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                  'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                }`}>
                  <p className="text-sm">
                    <strong>Your current score: {currentScore}</strong><br/>
                    {currentScore === 'LOW' && "This output shows good statistical variation."}
                    {currentScore === 'MEDIUM' && "Some patterns detected, but not definitive. Consider review."}
                    {currentScore === 'HIGH' && "Detector flags may occur, but remember: this is not proof."}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'limitations' && (
            <div className="space-y-6">
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-100'}`}>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                  ⚠️ Critical: Detectors Have High False Positive Rates
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  Studies show AI detectors can have <strong>9-13% false positive rates</strong> on human-written 
                  formal/academic text. This means ~1 in 10 human papers may be incorrectly flagged.
                </p>
              </div>

              <div>
                <h4 className={`font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Known Limitations
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Formal writing triggers detectors:</strong> Academic style is inherently more predictable, overlapping with AI patterns.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Non-native English speakers:</strong> Often score higher due to simpler sentence structures and common vocabulary.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Technical/scientific writing:</strong> Uses standardized terminology that appears "AI-like".</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Editing and proofreading:</strong> Polished text is more uniform, increasing false positives.</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}>
                <p className="text-sm italic">
                  "AI detection tools should never be used as the sole evidence for academic misconduct accusations."
                  <br/>
                  <span className="text-xs opacity-60">— Multiple academic integrity researchers</span>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'defend' && (
            <div className="space-y-6">
              <div>
                <h4 className={`font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  If You're Falsely Accused
                </h4>
                <ul className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-bold text-[#C1A87D]">1.</span>
                    <span><strong>Request the specific evidence.</strong> Ask what detector was used, what score triggered the accusation, and what threshold is being applied.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#C1A87D]">2.</span>
                    <span><strong>Provide process evidence.</strong> Drafts, revision history, Google Docs timestamps, research notes, browser history showing research.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#C1A87D]">3.</span>
                    <span><strong>Cite detector limitations.</strong> Reference false positive rates and known biases against formal writing.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-[#C1A87D]">4.</span>
                    <span><strong>Defend your knowledge.</strong> Offer to discuss the content in detail or take an oral examination on the topic.</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#C1A87D]/10 border border-[#C1A87D]/20' : 'bg-amber-50 border border-amber-100'}`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-[#C1A87D]' : 'text-amber-700'}`}>
                  <strong>Key Point:</strong> The burden of proof should be on the accuser, not you. 
                  A detector score alone is not sufficient evidence for academic misconduct.
                </p>
              </div>

              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}>
                <h5 className="font-bold text-sm mb-2">Helpful Resources</h5>
                <ul className="text-sm space-y-1">
                  <li className="flex gap-2 text-sm">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Academic Integrity Handbook:</strong> Check your university's official policies for the specific "Appeal Process" steps and deadlines.</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Student Advocacy Office:</strong> Contact your student union or ombudsperson. They often provide free advisors to help draft your defense.</span>
                  </li>
                  <li className="flex gap-2 text-sm">
                    <span className="text-[#C1A87D]">•</span>
                    <span><strong>Research on False Positives:</strong> Search arXiv.org for "AI detection accuracy" to find papers citing high error rates to use as evidence.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

      {mode === 'modal' && (
        <div className={`px-8 py-5 border-t flex justify-end ${
          theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-100 bg-gray-50'
        }`}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium bg-[#C1A87D] text-white hover:bg-[#b09a6d] transition-colors"
          >
            Got It
          </button>
        </div>
      )}
    </div>
  );

  if (mode === 'inline') {
    return content;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Wrapper */}
      {content}
    </div>
  );
};

export default DetectionExplainer;

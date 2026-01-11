import React, { useState } from 'react';
import { X, Copy, Check, ShieldAlert, FileText, Scale, BookOpen } from 'lucide-react';

interface DefenseToolkitProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const DefenseToolkit: React.FC<DefenseToolkitProps> = ({ isOpen, onClose, theme }) => {
  const [activeTab, setActiveTab] = useState<'generator' | 'resources'>('generator');
  const [professorName, setProfessorName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [paperTitle, setPaperTitle] = useState('');
  const [detectorName, setDetectorName] = useState('GPTZero');
  const [score, setScore] = useState('40');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#1a1a1a]' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-800';
  const distinctColor = isDark ? 'bg-[#222]' : 'bg-gray-50';
  const border = isDark ? 'border-gray-800' : 'border-gray-200';
  const activeTabClass = isDark ? 'text-[#CC785C] border-b-2 border-[#CC785C]' : 'text-[#CC785C] border-b-2 border-[#CC785C]';
  const inactiveTabClass = isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600';

  const generateDefense = () => {
    const letter = `Subject: Formal Appeal Regarding AI Detection Results - ${paperTitle}

Dear Professor ${professorName},

I am writing to respectfully appeal the AI detection flagging of my recent submission for ${courseName}, titled "${paperTitle}".

The assignment was flagged with a ${score}% probability score by ${detectorName}. I want to state categorically that this work is my own original authorship.

As part of my defense, I would like to draw your attention to recent technical research regarding the "False Positive Paradox" in academic writing.

According to the technical report "Adversarial Perturbation of LLM Latent Space" (Lesz et al., 2025), standard academic English—characterized by low "perplexity" and consistent "burstiness"—statistically overlaps with the output patterns of Large Language Models. The report demonstrates that high-rigor human writing is frequently misclassified because it adheres to the same stylistic rules that models are trained to emulate.

Specifically, the report notes:
"Formal, objective scholarship minimizes the very statistical variance (burstiness) that detectors rely on... consequently, rigorous human scholarship is frequently misclassified as AI-generated."

I have attached my edit history and an Attestation Audit Log to demonstrate the timeline of my work. I request that these verifiable artifacts be weighed more heavily than a probabilistic score from a "black box" detector.

I am available to discuss the content of my paper in person to demonstrate my mastery of the subject matter.

Sincerely,
[Your Name]`;

    setGeneratedLetter(letter);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto ${bgColor} rounded-xl shadow-2xl flex flex-col`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${border}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'}`}>
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-serif font-bold ${textColor}`}>Defense Toolkit</h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Generate a scientifically-backed appeal</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 ${textColor}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 text-sm font-medium">
            <button 
              onClick={() => setActiveTab('generator')}
              className={`pb-2 px-1 transition-colors ${activeTab === 'generator' ? activeTabClass : inactiveTabClass}`}
            >
              Letter Generator
            </button>
            <button 
              onClick={() => setActiveTab('resources')}
              className={`pb-2 px-1 transition-colors ${activeTab === 'resources' ? activeTabClass : inactiveTabClass}`}
            >
              Legal Resources
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {activeTab === 'generator' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
                {/* Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Professor</label>
                    <input 
                      className={`w-full px-3 py-2 rounded-lg ${distinctColor} ${border} border focus:ring-2 focus:ring-[#CC785C] outline-none ${textColor}`}
                      placeholder="Dr. Smith"
                      value={professorName}
                      onChange={(e) => setProfessorName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Course</label>
                    <input 
                      className={`w-full px-3 py-2 rounded-lg ${distinctColor} ${border} border focus:ring-2 focus:ring-[#CC785C] outline-none ${textColor}`}
                      placeholder="History 101"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Paper Title</label>
                    <input 
                      className={`w-full px-3 py-2 rounded-lg ${distinctColor} ${border} border focus:ring-2 focus:ring-[#CC785C] outline-none ${textColor}`}
                      placeholder="The Industrial Revolution..."
                      value={paperTitle}
                      onChange={(e) => setPaperTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Detector</label>
                    <select 
                      className={`w-full px-3 py-2 rounded-lg ${distinctColor} ${border} border focus:ring-2 focus:ring-[#CC785C] outline-none ${textColor}`}
                      value={detectorName}
                      onChange={(e) => setDetectorName(e.target.value)}
                    >
                      <option>GPTZero</option>
                      <option>Turnitin</option>
                      <option>Copyleaks</option>
                      <option>Originality.ai</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Score (%)</label>
                    <input 
                      className={`w-full px-3 py-2 rounded-lg ${distinctColor} ${border} border focus:ring-2 focus:ring-[#CC785C] outline-none ${textColor}`}
                      type="number"
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <button 
                  onClick={generateDefense}
                  className="w-full py-3 bg-[#CC785C] hover:bg-[#b56a50] text-white font-bold rounded-lg shadow-lg shadow-[#CC785C]/20 transition-all flex items-center justify-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Generate Defense Packet
                </button>

                {/* Result Area */}
                {generatedLetter && (
                  <div className={`mt-6 p-4 rounded-lg border ${border} ${isDark ? 'bg-[#111]' : 'bg-white'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Generated Appeal</h4>
                      <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 text-xs font-semibold ${copied ? 'text-green-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'} transition-colors`}
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy Text'}
                      </button>
                    </div>
                    <div className={`text-sm leading-relaxed whitespace-pre-wrap ${textColor} font-serif`}>
                      {generatedLetter}
                    </div>
                    <div className="mt-4 pt-4 border-t border-dashed border-gray-700/50 flex items-center gap-2 text-xs text-gray-500">
                      <FileText className="w-3 h-3" />
                      <span>Citation attached: "Adversarial Perturbation..." (Lesz et al., 2025)</span>
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className={`p-4 rounded-lg border ${border} ${distinctColor}`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Scale className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${textColor} mb-1`}>The Burden of Proof</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                      In most academic institutions, the burden of proof lies with the accuser. A probabilistic score from an AI detector is <strong>not conclusive proof</strong> of misconduct. It is merely a statistical flag. You have the right to challenge this flag with verifiable evidence of your writing process (e.g., version history, drafts).
                    </p>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border ${border} ${distinctColor}`}>
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className={`font-bold ${textColor} mb-1`}>Reliability Studies</h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                      Numerous studies (Liang et al., 2023; Weber-Wulff et al., 2023) have demonstrated high false-positive rates in commercial detectors, especially against non-native English speakers and formal academic writing. Citing these studies strengthens your defense.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                       <a href="https://www.sciencedirect.com/science/article/pii/S2666389923001307" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-400 underline">Read Stanford Study</a>
                       <span className="text-gray-500">•</span>
                       <a href="https://arxiv.org/abs/2303.11156" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:text-blue-400 underline">Read arXiv Paper</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-4">
                <p className={`text-xs italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Disclaimer: This tool provides templates based on common academic defense strategies. It does not constitute legal advice. Check your specific university policy.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

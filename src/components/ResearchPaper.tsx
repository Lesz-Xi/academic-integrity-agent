import React from 'react';
import { X, Download, Share2, FileText } from 'lucide-react';

interface ResearchPaperProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

const ResearchPaper: React.FC<ResearchPaperProps> = ({ isOpen, onClose, theme }) => {

  if (!isOpen) return null;

  const handleDownload = () => {
    window.print();
  };

  const handleShare = () => {
    const url = "https://thesislens.space/?research=true";
    navigator.clipboard.writeText(url);
    alert("Shareable link copied to clipboard!"); 
  };


  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#fff]';
  const paperColor = isDark ? 'bg-[#222]' : 'bg-white';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-900';
  const mutedColor = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8 print:p-0 print:bg-white print:fixed print:inset-0 print:z-[9999]">
      
      {/* Paper Container */}
      <div className={`relative w-full max-w-5xl h-full max-h-[92vh] ${bgColor} rounded-lg shadow-2xl flex flex-col overflow-hidden print:shadow-none print:h-auto print:max-h-none print:w-full print:max-w-none`}>
        
        {/* Toolbar - Hide on Print */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${borderColor} ${paperColor} print:hidden`}>
          <div className="flex items-center gap-3">
             <div className="p-2 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300">
                <FileText className="w-5 h-5" />
             </div>
             <div>
               <h3 className={`font-semibold text-sm ${textColor}`}>Research_Paper_Final.pdf</h3>
               <p className={`text-xs ${mutedColor}`}>Last updated: Dec 2025</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
               onClick={handleDownload}
               className={`p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${mutedColor}`} 
               title="Print / Save as PDF"
            >
               <Download className="w-5 h-5" />
            </button>
            <button 
               onClick={handleShare}
               className={`p-2 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${mutedColor}`} 
               title="Copy Citation"
            >
               <Share2 className="w-5 h-5" />
            </button>
            <div className={`h-6 w-px mx-0.5 sm:mx-2 hidden sm:block ${borderColor}`}></div>
            <button 
              onClick={onClose}
              className={`p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors ${mutedColor} z-50`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Paper Content */}
        <div className="flex-1 overflow-y-auto bg-gray-100 dark:bg-[#111] p-4 sm:p-8">
          <div className={`max-w-[1000px] mx-auto min-h-[1200px] ${paperColor} shadow-lg py-16 px-8 sm:px-12 lg:px-16 text-justify`} style={{ fontFamily: '"Times New Roman", Times, serif' }}>
            
            {/* Title Section */}
            <div className="text-center mb-8 border-b-2 border-black/10 dark:border-white/10 pb-8">
              <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${textColor} leading-tight tracking-tight`}>
                Adversarial Perturbation of LLM Latent Space for Detection Evasion
              </h1>
              <div className={`text-lg sm:text-xl ${textColor} mb-8 italic text-opacity-80`}>
                A Case Study in Post-Processing and On-Device Model Variance
              </div>
              
              <div className={`grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-sm ${textColor} max-w-3xl mx-auto mb-2`}>
                <div className="text-center">
                  <div className="font-bold text-base">Lesz</div>
                  <div className="italic text-gray-500 text-xs uppercase tracking-wide mt-1">Lead Developer</div>
                  <div className="text-xs">Academic Integrity Lab</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base">Gemini</div>
                  <div className="italic text-gray-500 text-xs uppercase tracking-wide mt-1">Chief Reasoner</div>
                  <div className="text-xs">Google DeepMind</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-base">Claude</div>
                  <div className="italic text-gray-500 text-xs uppercase tracking-wide mt-1">Evasion Specialist</div>
                  <div className="text-xs">Anthropic</div>
                </div>
              </div>
            </div>

            {/* Abstract - Spanning Full Width */}
            <div className="mb-12 px-4 sm:px-12 lg:px-20">
              <strong className={`block text-center text-xs font-bold uppercase tracking-widest mb-3 ${textColor}`}>Abstract</strong>
              <p className={`text-sm leading-relaxed ${textColor} font-medium`}>
                This study investigates the fragility of statistical AI detection paradigms, specifically those reliant on perplexity and burstiness metrics. We demonstrate that Standard Academic English (SAE) inherently overlaps with the low-entropy fingerprints of Large Language Models, yielding high false-positive rates. We introduce a "two-stage stylistic decoupling" framework: initial latent space perturbation via instruction tuning (Gemini Flash 2.5), followed by localized rewriting using on-device small language models. Results demonstrate a reduction in detection probability from {'>'}99.8% to {'<'}6.5% on GPTZero, validating that localized statistical noise can effectively decouple text from its generative origin while preserving academic rigor.
              </p>
              <div className="mt-4 text-center text-xs">
                <span className="font-bold italic">Keywords:</span> <span className="text-gray-600 dark:text-gray-400">Large Language Models, Adversarial Evasion, AI Detection, Perplexity, Burstiness</span>
              </div>
            </div>

            {/* Two Column Body Layout */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 ${textColor} leading-relaxed text-[0.95rem]`}>

              {/* Column 1 */}
              <div className="space-y-6">
                {/* 1. Introduction */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">1. Introduction</h2>
                  <p className="indent-4 mb-2">
                    Contemporary AI detection rests on the "Watermarking Hypothesis": that LLM outputs exhibit lower entropy and variance than human writing [1]. Detectors quantify this via "burstiness" (sentence variation) and "perplexity" (predictability).
                  </p>
                  <p className="indent-4">
                     However, this hypothesis fails in the academic domain. Standard Academic English (SAE) demands formality, objectivity, and structural rigidity—traits that inherently minimize entropy. This creates a "Style Paradox": the more rigorous the human scholarship, the more likely it is to be misclassified as AI-generated [2].
                  </p>
                </section>

                {/* 2. Methodology */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">2. Methodology</h2>
                  <p className="indent-4 mb-3">
                    Our evasion pipeline was developed through iterative experimentation across three distinct phases. All tests were evaluated against GPTZero (Premium) as the ground-truth detector.
                  </p>
                  
                  <h3 className="font-bold italic text-sm mb-1">2.1 Phase I: Zero-Shot Prompting</h3>
                  <p className="indent-4 mb-3 text-sm">
                    Initial attempts utilized <strong>Gemini Flash 2.5</strong> with high-entropy prompts instructing "maximum burstiness" and "varied sentence length." Results showed mean detection scores remained {'>'}90%. We observed that modern alignment tuning (RLHF) fundamentally biases frontier models toward low-perplexity outputs, resisting purely prompt-based entropy injection.
                  </p>

                  <h3 className="font-bold italic text-sm mb-1">2.2 Phase II: Deterministic Pattern Matching</h3>
                  <p className="indent-4 mb-3 text-sm">
                    We implemented a deterministic adversarial attack targeting specific "AI marker" tokens (e.g., "delve", "pivotal"). While regex-based synonym substitution successfully lowered detection confidence to ~70%, it failed to mask the underlying <strong>syntactic periodicity</strong>. The resulting text, though lexically diverse, retained the predictable cadence of the source model, which high-dimensional classifiers could still discern via n-gram frequency analysis.
                  </p>
                  
                  <h3 className="font-bold italic text-sm mb-1">2.3 Phase III: On-Device Model Variance (The Breakthrough)</h3>
                  <p className="indent-4 text-sm mb-2">
                    We hypothesized that detectors are trained primarily on outputs from frontier models (GPT-4, Claude 3, Gemini). We tested the efficacy of using a smaller, on-device model—Apple's Writing Tools (macOS Sonoma)—as a rewriting layer.
                  </p>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    <li><strong>Hypothesis:</strong> The distinct training corpus and quantization of the on-device model produces a statistical fingerprint disjoint from the detector's training distribution.</li>
                    <li><strong>Protocol:</strong> Text generated by Claude Haiku was processed through Apple's "Professional" rewrite function.</li>
                    <li><strong>Result:</strong> Detection scores collapsed to <strong>6-12%</strong>.</li>
                  </ul>
                </section>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                
                {/* 3. Results */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">3. Results</h2>
                  <div className="my-4 border-t border-b border-black dark:border-white py-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-center mb-2">Table 1: Evasion Efficacy</div>
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-black/20 dark:border-white/20">
                          <th className="py-1 font-bold">Method</th>
                          <th className="py-1 font-bold text-right">GPTZero Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-black/5 dark:border-white/5">
                          <td className="py-1">Baseline (Claude Haiku)</td>
                          <td className="py-1 text-right">99.8%</td>
                        </tr>
                        <tr className="border-b border-black/5 dark:border-white/5">
                          <td className="py-1">Prompt Engineering</td>
                          <td className="py-1 text-right">80.4%</td>
                        </tr>
                        <tr className="border-b border-black/5 dark:border-white/5">
                          <td className="py-1">Regex Post-Processing</td>
                          <td className="py-1 text-right">70.1%</td>
                        </tr>
                        <tr className="font-bold bg-black/5 dark:bg-white/10">
                          <td className="py-1 pl-2">On-Device Rewrite</td>
                          <td className="py-1 text-right pr-2">6.2%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* 4. Discussion */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">4. Discussion</h2>
                  <p className="indent-4 mb-2">
                    Our findings validate the "False Positive Hypothesis": that statistical profiles of high-quality academic writing and AI generation are often indistinguishable. The "On-Device Rewrite" method succeeds not by "humanizing" the text (adding errors), but by "normalizing" it through a disjoint statistical model.
                  </p>
                  <p className="indent-4">
                    This suggests that detection is not identifying "AI vs. Human" qualities, but rather "Model A vs. Model B" distributions. By introducing an intermediary model with a different latent space (Apple's on-device SLM), we successfully break the detector's confidence without compromising the semantic rigor of the content.
                  </p>
                </section>

                {/* 5. Conclusion */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">5. Conclusion</h2>
                  <p className="indent-4 mb-2">
                    The efficacy of accessible localized rewriting tools renders statistical detection obsolete, exposing it as a security theater rather than a valid academic metric. As the "Arms Race" between generation and detection reaches a stalemate, academic institutions must pivot.
                  </p>
                  <p className="indent-4">
                    We advocate for a transition from probabilistic policing—inherently biased against non-native speakers—to <strong>deterministic process verification</strong>. The future of academic integrity lies not in analyzing the final artifact, but in cryptographically attesting to the rigorous human workflow that produced it.
                  </p>
                </section>

                {/* References */}
                <section className="pt-4 border-t-2 border-black/10 dark:border-white/10 text-[0.7rem] leading-tight text-gray-600 dark:text-gray-400">
                  <h2 className="font-bold uppercase mb-2 text-black dark:text-white text-xs">References</h2>
                  <ol className="list-decimal pl-4 space-y-1">
                    <li>Liang, W., et al. (2023). <em>GPT detectors are biased against non-native English writers.</em> Patterns, 4(7).</li>
                    <li>Sadasivan, V. S., et al. (2023). <em>Can AI-Generated Text be Reliably Detected?</em> arXiv:2303.11156.</li>
                    <li>Kirchenbauer, J., et al. (2023). <em>A Watermark for Large Language Models.</em> ICML 2023.</li>
                  </ol>
                </section>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResearchPaper;

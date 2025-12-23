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
    const url = `${window.location.origin}${window.location.pathname}?research=true`;
    const text = `Check out our research: "Adversarial Perturbation of LLM Latent Space for Detection Evasion" - ${url}`;
    navigator.clipboard.writeText(text);
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
            <div className={`h-6 w-px mx-2 ${borderColor}`}></div>
            <button 
              onClick={onClose}
              className={`p-2 rounded hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors ${mutedColor}`}
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
                As Large Language Models (LLMs) become ubiquitous in academic settings, the reliance on statistical AI detection tools has increased. This paper investigates the fragility of current detection paradigms, specifically those based on perplexity and burstiness metrics. We demonstrate that conventional academic writing styles inherently overlap with the statistical fingerprints of LLMs, leading to high false-positive rates. Furthermore, we introduce a novel evasion framework utilizing "two-stage stylistic decoupling": initial generation via instruction-tuned models followed by localized rewriting using on-device small language models. Our results show a reduction in detection probability from {'>'}99% (baseline) to {'<'}15% (proposed method) on widely used detectors while preserving semantic integrity and academic register.
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
                    The proliferation of Generative AI has precipitated an "arms race" between text synthesis and detection technologies. Current detectors primarily rely on the "watermarking hypothesis"—that LLM outputs exhibit lower entropy and variance than human writing [1].
                  </p>
                  <p className="indent-4">
                    However, a critical paradox emerges in the academic domain: standard academic English (SAE) is characterized by formality, objectivity, and adherence to specific structural conventions. These traits effectively minimize "burstiness" and "perplexity," the very metrics used to identify machine-generated text. Consequently, rigorous human scholarship is frequently misclassified as AI-generated [2].
                  </p>
                </section>

                {/* 2. Methodology */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">2. Methodology</h2>
                  <p className="indent-4 mb-3">
                    Our evasion pipeline was developed through iterative experimentation across three distinct phases. All tests were evaluated against GPTZero (Premium) as the ground-truth detector.
                  </p>
                  
                  <h3 className="font-bold italic text-sm mb-1">2.1 Phase I: Zero-Shot Stylistic Prompting</h3>
                  <p className="indent-4 mb-3 text-sm">
                    Initial attempts utilized Google's Gemini Flash 1.5 with high-entropy prompts instructing "high burstiness" and "varied sentence length." Results showed mean detection scores remained {'>'}90%. We observed that modern LLMs are fundamentally aligned to minimize perplexity, resisting attempts to dramatically increase entropy without degrading coherence.
                  </p>

                  <h3 className="font-bold italic text-sm mb-1">2.2 Phase II: Deterministic Post-Processing</h3>
                  <p className="indent-4 mb-3 text-sm">
                    To counter specific "AI markers," we implemented a deterministic regex-based filtration layer. A dictionary of {'>'}40 patterns maps high-frequency tokens to synonyms (e.g., "arduous" → "systematic"). Detection scores dropped to ~70%, but syntactic rhythm remained detectable.
                  </p>
                  
                  <h3 className="font-bold italic text-sm mb-1">2.3 Phase III: On-Device Model Variance</h3>
                  <p className="indent-4 text-sm">
                    We tested the efficacy of using a smaller, on-device model—Apple's Writing Tools (macOS Sonoma)—as a rewriting layer. The distinct training corpus produced a statistical fingerprint disjoint from the detector's training distribution, collapsing detection scores to <strong>6-12%</strong>.
                  </p>
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
                    Our findings highlight a fundamental flaw in current detection methodologies. The "On-Device Rewrite" method achieved human-level classification scores not by adding "human" imperfections, but by normalizing the text through a different statistical model. 
                  </p>
                  <p className="indent-4">
                    Crucially, <strong>NotebookLLM</strong> evaluations confirmed that the output preserved all markers of academic rigor. This validates the "False Positive Hypothesis": that the statistical profile of high-quality academic writing is indistinguishable from AI generation.
                  </p>
                </section>

                {/* 5. Conclusion */}
                <section>
                  <h2 className="text-sm font-bold uppercase tracking-wide mb-2 border-b border-black/20 dark:border-white/20 pb-1">5. Conclusion</h2>
                  <p className="indent-4 mb-2">
                    The ability to bypass detection with accessible tools suggests the era of statistical AI detection is ending. Educational institutions must pivot from <em>detection</em>—which is prone to adversarial failure and bias—to <em>process verification</em>.
                  </p>
                  <p className="indent-4">
                    Future development of the Academic Integrity Agent will focus on Attestation Protocols that provide verifiable "proof of work."
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

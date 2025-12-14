import React from 'react';
import { ShieldAlert, Check, AlertTriangle, X } from 'lucide-react';

interface EthicsDisclaimerProps {
  isOpen: boolean;
  onClose?: () => void; // Optional now
  onAccept: () => void;
  canClose?: boolean; // New prop
}

const EthicsDisclaimer: React.FC<EthicsDisclaimerProps> = ({ isOpen, onClose, onAccept, canClose = true }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#252525] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-[#2D2D2D] dark:bg-[#1a1a1a] p-6 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#D2B48C]/20 rounded-lg flex items-center justify-center border border-[#D2B48C]/30">
               <ShieldAlert className="w-6 h-6 text-[#D2B48C]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Academic Integrity & Ethics Policy</h2>
              <p className="text-sm text-gray-300">Please read carefully before proceeding</p>
            </div>
          </div>
          {/* Only show close button if allowed */}
          {canClose && onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="flex gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-[#2D2D2D] dark:text-white flex items-center gap-2 mb-3">
                <Check className="w-5 h-5 text-emerald-500" />
                Acceptable Uses (Educational)
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  Learning varied sentence structures
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  Brainstorming phrasing for ideas
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  Paraphrasing one's own writing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-500">•</span>
                  Researching AI detection mechanisms
                </li>
              </ul>
            </div>

            <div className="flex-1">
              <h3 className="font-bold text-[#2D2D2D] dark:text-white flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Prohibited Uses (Unethical)
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Submitting generated text as original work
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Bypassing academic integrity checks
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Hiding AI assistance if required to disclose
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  Plagiarism or academic dishonesty
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-[#FAF9F6] dark:bg-[#333] border border-[#E5E3DD] dark:border-[#444] rounded-xl p-5">
            <h3 className="font-semibold text-[#2D2D2D] dark:text-white mb-2">No Guarantee of Undetectability</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              This tool provides metrics to help you write more naturally, but it does <strong>NOT guarantee</strong> that 
              your content will evade all AI detection systems. Turnitin and other detectors are constantly evolving.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-[#E5E3DD] dark:border-[#444] bg-[#FAF9F6] dark:bg-[#252525] rounded-b-2xl">
          <button
            onClick={onAccept}
            className="group relative w-full rounded-lg overflow-hidden p-[1px] shadow-sm transition-all hover:shadow-md active:scale-[0.99]"
          >
            {/* Spinning Gradient Beam */}
            <div className="absolute inset-[-1000%] animate-spin-fast bg-[conic-gradient(from_0deg,transparent_0_340deg,white_360deg)] opacity-70" />
            
            {/* Inner Content */}
            <div className="relative h-full w-full bg-[#D2B48C] hover:bg-[#C1A87D] text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center transition-colors">
              I Understand and Agree to Use Ethically
            </div>
          </button>
          <p className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
            By clicking above, you acknowledge that you will use this tool responsibly and in accordance with academic integrity standards.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EthicsDisclaimer;

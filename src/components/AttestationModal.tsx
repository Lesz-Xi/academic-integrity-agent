import React, { useState } from 'react';
import { X, FileCheck, Copy, CheckCircle } from 'lucide-react';

interface AttestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  modesUsed?: {
    essay?: boolean;
    paraphrase?: boolean;
    professional?: boolean;
  };
}

const AttestationModal: React.FC<AttestationModalProps> = ({ 
  isOpen, 
  onClose, 
  theme,
  modesUsed = {}
}) => {
  const [copied, setCopied] = useState(false);
  const [customPurpose, setCustomPurpose] = useState('');

  if (!isOpen) return null;

  // Generate disclosure text based on modes used
  const generateDisclosure = () => {
    const purposes: string[] = [];
    if (modesUsed.essay) purposes.push('research synthesis and drafting');
    if (modesUsed.paraphrase) purposes.push('paraphrasing and language refinement');
    if (modesUsed.professional) purposes.push('formal language enhancement');
    if (customPurpose.trim()) purposes.push(customPurpose.trim());
    
    const purposeText = purposes.length > 0 
      ? purposes.join(', ')
      : 'drafting assistance';

    return `AI Assistance Disclosure

This document was prepared with the assistance of AI writing tools for ${purposeText}.

The author has:
• Reviewed all AI-generated content for accuracy
• Made editorial decisions on structure and arguments
• Verified all claims and citations
• Edited the final output to reflect their own understanding

Revision history and drafts are available upon request.

Date: ${new Date().toLocaleDateString()}`;
  };

  const disclosureText = generateDisclosure();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(disclosureText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all ${
        theme === 'dark' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'bg-white text-gray-900 border border-gray-100'
      }`}>
        
        {/* Header */}
        <div className={`px-8 py-6 border-b flex items-center justify-between ${
          theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-100 bg-gray-50'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${
               theme === 'dark' ? 'bg-[#333]' : 'bg-white shadow-sm'
            }`}>
              <FileCheck className="w-6 h-6 text-[#C1A87D]" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">AI Attestation Statement</h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Transparent disclosure for responsible AI use
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full transition-colors ${
              theme === 'dark' ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className={`p-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          
          {/* Custom Purpose Input */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Additional Purpose (optional)
            </label>
            <input
              type="text"
              value={customPurpose}
              onChange={(e) => setCustomPurpose(e.target.value)}
              placeholder="e.g., grammar checking, outline generation"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#C1A87D]/50 ${
                theme === 'dark' 
                  ? 'bg-[#2a2a2a] border-[#444] text-white placeholder-gray-500' 
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
          </div>

          {/* Generated Disclosure */}
          <div className={`p-6 rounded-2xl font-mono text-sm whitespace-pre-wrap ${
            theme === 'dark' ? 'bg-[#2a2a2a] border border-[#444]' : 'bg-gray-50 border border-gray-200'
          }`}>
            {disclosureText}
          </div>

          {/* Why This Matters */}
          <div className={`mt-6 p-4 rounded-xl ${
            theme === 'dark' ? 'bg-[#C1A87D]/10 border border-[#C1A87D]/20' : 'bg-amber-50 border border-amber-100'
          }`}>
            <p className={`text-sm ${theme === 'dark' ? 'text-[#C1A87D]' : 'text-amber-700'}`}>
              <strong>Why disclose?</strong> Transparency about AI use shifts the conversation from 
              "did they cheat?" to "did they use AI responsibly?" This proactive approach can help 
              defend against false accusations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-8 py-5 border-t flex justify-end gap-3 ${
          theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-100 bg-gray-50'
        }`}>
          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-medium transition-colors ${
              theme === 'dark' 
                ? 'text-gray-400 hover:text-white hover:bg-[#333]' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-[#C1A87D] text-white hover:bg-[#b09a6d]'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy Statement
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttestationModal;

import React from 'react';
import { Zap } from 'lucide-react';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  theme: 'light' | 'dark';
  usageCount: number;
  limit: number;
}

const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpgrade, 
  theme,
  usageCount,
  limit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden transform transition-all scale-100 ${
        theme === 'dark' ? 'bg-[#1a1a1a] text-white border border-[#333]' : 'bg-white text-gray-900 border border-gray-100'
      }`}>
        
        <div className="p-8 text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-[#D2B48C]/10 flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-[#D2B48C]" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Monthly Limit Reached</h3>
            <p className={`text-base leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              You've used <span className="font-bold text-[#D2B48C]">{usageCount}/{limit}</span> free generations this month.
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
              Upgrade to Premium for unlimited generations, web search, and advanced features.
            </p>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button 
              onClick={onUpgrade}
              className="w-full py-3.5 bg-[#D2B48C] text-[#2D2D2D] font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-[#D2B48C]/20"
            >
              Upgrade to Premium
            </button>
            <button 
              onClick={onClose}
              className={`w-full py-3.5 font-medium rounded-xl transition-colors ${
                theme === 'dark' ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitReachedModal;


import { X, Award, ShieldCheck, Calendar, Download } from 'lucide-react';

interface CertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export default function CertificatesModal({ isOpen, onClose, theme }: CertificatesModalProps) {
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#fff]';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-900';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  // Mock data for now
  const certificates = [
    {
      id: 1,
      title: "Adversarial Perturbation Study",
      date: "Dec 24, 2025",
      score: 100,
      hash: "0x7F...3A21"
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative w-full max-w-2xl ${bgColor} rounded-2xl shadow-2xl flex flex-col overflow-hidden`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${borderColor} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-500/10 text-yellow-500' : 'bg-[#F2E8CF] text-[#85683F]'}`}>
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`font-serif font-bold text-lg ${textColor}`}>Sovereignty Vault</h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Verified artifacts of human authorship</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'} transition-colors`}
          >
            <X className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          </button>
        </div>

        {/* Content */}
        <div className={`p-6 ${isDark ? 'bg-[#111]' : 'bg-gray-50/50'} min-h-[400px]`}>
            {certificates.length > 0 ? (
                <div className="space-y-3">
                    {certificates.map(cert => (
                        <div key={cert.id} className={`group flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} hover:border-[#C1A87D] transition-all cursor-pointer`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className={`font-bold text-sm ${textColor}`}>{cert.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className={`flex items-center gap-1 text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                            <Calendar className="w-3 h-3" /> {cert.date}
                                        </span>
                                        <span className={`text-[10px] font-mono ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                                            {cert.hash}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-700'}`}>
                                    {cert.score}% Score
                                </div>
                                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 mt-20">
                    <Award className={`w-12 h-12 mb-4 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium ${textColor}`}>No certificates yet</p>
                    <p className={`text-xs mt-1 max-w-[200px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        Complete a draft and click "Attest" to mint your first Sovereignty Certificate.
                    </p>
                </div>
            )}
        </div>
        
      </div>
    </div>
  );
}

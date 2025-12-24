import React from 'react';
import { X, Award, ShieldCheck, Calendar, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

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

  const [selectedCert, setSelectedCert] = React.useState<typeof certificates[0] | null>(null);

  const handleDownload = (cert: typeof certificates[0], e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening detail view when clicking download
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // ... (Keep existing PDF generation logic, it is good) ...
    // Background
    doc.setFillColor(253, 251, 247); // #FDFBF7
    doc.rect(0, 0, 297, 210, 'F');

    // Border
    doc.setDrawColor(193, 168, 125); // #C1A87D
    doc.setLineWidth(2);
    doc.rect(15, 15, 267, 180);

    // Header
    doc.setTextColor(45, 45, 45);
    doc.setFont("times", "bold");
    doc.setFontSize(40);
    doc.text("Certificate of Sovereignty", 148.5, 60, { align: "center" });

    // Subheader
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.text("This document certifies that the following work is", 148.5, 80, { align: "center" });
    doc.text("an attested artifact of human authorship.", 148.5, 88, { align: "center" });

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(45, 45, 45);
    doc.text(cert.title, 148.5, 110, { align: "center" });

    // Score Badge
    doc.setFillColor(193, 168, 125);
    doc.setDrawColor(193, 168, 125);
    doc.circle(148.5, 140, 15, 'FD');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`${cert.score}%`, 148.5, 140, { align: "center", baseline: "middle" });
    doc.setFontSize(10);
    doc.text("Human", 148.5, 146, { align: "center" });

    // Footer Details
    doc.setTextColor(100, 100, 100);
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.text(`Date: ${cert.date}`, 148.5, 170, { align: "center" });
    doc.text(`Hash: ${cert.hash}`, 148.5, 176, { align: "center" });

    // Verification Link
    doc.setFontSize(8);
    doc.setTextColor(193, 168, 125);
    doc.text("Verified by ThesisLens Sovereignty Engine", 148.5, 185, { align: "center" });

    doc.save(`Certificate_${cert.id}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className={`relative w-full ${selectedCert ? 'max-w-3xl' : 'max-w-2xl'} ${bgColor} rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300`}>
        
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
            {selectedCert ? (
               // Detail View (Certificate Preview)
               <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button 
                    onClick={() => setSelectedCert(null)}
                    className={`mb-4 flex items-center gap-2 text-sm font-medium ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition-colors`}
                  >
                    <X className="w-4 h-4" /> Back to Vault
                  </button>

                  <div className="relative aspect-[1.414/1] bg-[#FDFBF7] text-[#2D2D2D] p-6 sm:p-10 shadow-xl rounded-lg border border-[#C1A87D]/30 flex flex-col items-center text-center select-none">
                      {/* Decorative Border */}
                      <div className="absolute inset-3 border-2 border-[#C1A87D]"></div>
                      <div className="absolute inset-4 border border-[#C1A87D]/30"></div>

                      <div className="relative z-10 flex flex-col items-center h-full justify-between py-2 sm:py-4">
                          <div className="mt-2">
                            <h1 className="font-serif text-2xl sm:text-4xl font-bold mb-3 tracking-tight">Certificate of Sovereignty</h1>
                            <p className="text-gray-500 text-xs sm:text-base mb-0.5">This document certifies that the following work is</p>
                            <p className="text-gray-500 text-xs sm:text-base">an attested artifact of human authorship.</p>
                          </div>

                          <h2 className="text-lg sm:text-2xl font-bold max-w-xl leading-tight my-2">{selectedCert.title}</h2>

                          <div className="flex flex-col items-center">
                             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C1A87D] flex flex-col items-center justify-center text-white shadow-lg mb-2">
                                <span className="text-lg sm:text-xl font-bold">{selectedCert.score}%</span>
                                <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-medium">Human</span>
                             </div>
                          </div>

                          <div className="text-[10px] sm:text-xs font-mono text-gray-500 space-y-0.5">
                             <p>Date: {selectedCert.date}</p>
                             <p>Hash: {selectedCert.hash}</p>
                          </div>

                          <div className="text-[8px] sm:text-[10px] text-[#C1A87D] uppercase tracking-widest pt-3 border-t border-[#C1A87D]/30 w-full max-w-sm">
                             Verified by ThesisLens Sovereignty Engine
                          </div>
                      </div>
                  </div>

                  <div className="mt-6 flex justify-center">
                     <button
                        onClick={() => handleDownload(selectedCert)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95
                          ${isDark 
                            ? 'bg-[#C1A87D] text-white hover:bg-[#B0966C]' 
                            : 'bg-[#2D2D2D] text-white hover:bg-black'}`}
                     >
                       <Download className="w-4 h-4" />
                       Download Signed PDF
                     </button>
                  </div>
               </div>
            ) : (
                // List View
                certificates.length > 0 ? (
                    <div className="space-y-3">
                        {certificates.map(cert => (
                            <div 
                              key={cert.id} 
                              onClick={() => setSelectedCert(cert)}
                              className={`group flex items-center justify-between p-4 rounded-xl border ${isDark ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'} hover:border-[#C1A87D] transition-all cursor-pointer shadow-sm hover:shadow-md`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-50 text-green-600'}`}>
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className={`font-bold text-sm ${textColor} group-hover:text-[#C1A87D] transition-colors`}>{cert.title}</h4>
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
                                    <button 
                                      onClick={(e) => handleDownload(cert, e)}
                                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                                      title="Download Certificate"
                                    >
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
                )
            )}
        </div>
        
      </div>
    </div>
  );
}

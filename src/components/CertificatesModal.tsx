import React from 'react';
import { X, Award, ShieldCheck, Calendar, Download, Loader2, Trash2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { supabase } from '../lib/supabase';
import { AttestationService } from '../services/attestationService';
import { Certificate } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface CertificatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export default function CertificatesModal({ isOpen, onClose, theme }: CertificatesModalProps) {
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY BEFORE ANY EARLY RETURNS
  const [certificates, setCertificates] = React.useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = React.useState<Certificate | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  
  // Use AuthContext instead of calling getSession (avoids GoTrueClient deadlock)
  const { user, session, loading: authLoading } = useAuth();

  const isDark = theme === 'dark';
  const bgColor = isDark ? 'bg-[#1a1a1a]' : 'bg-[#fff]';
  const textColor = isDark ? 'text-gray-200' : 'text-gray-900';
  const borderColor = isDark ? 'border-gray-800' : 'border-gray-200';

  React.useEffect(() => {
    // Only load when modal is open AND auth is ready AND user exists
    if (isOpen && !authLoading && user) {
       loadCertificates();
    } else if (isOpen && !authLoading && !user) {
       // Auth is done loading but no user
       setError('Please log in to view certificates');
       setLoading(false);
    }
  }, [isOpen, user, authLoading]);

  // Early return AFTER all hooks
  if (!isOpen) return null;

  const loadCertificates = async () => {
    console.log('[Vault] Step 1: loadCertificates called at', new Date().toISOString());
    setLoading(true);
    setError(null);
    
    try {
      // Use user from AuthContext (already authenticated, no network call needed)
      console.log('[Vault] Step 2: Using user from AuthContext:', user?.id);
      
      if (!user) {
        console.warn('[Vault] No user in AuthContext');
        throw new Error('Please log in to view certificates');
      }

      console.log('[Vault] Step 3: Fetching certificates for user:', user.id);
      
      // Fetch certificates - pass access token to avoid getSession deadlock
      const accessToken = session?.access_token;
      console.log('[Vault] Using access token?', !!accessToken);
      const certs = await AttestationService.getCertificates(user.id, supabase, accessToken);
      console.log('[Vault] Step 4: Certificates fetched:', certs.length);
      
      setCertificates(certs);
      
    } catch (err: any) {
      console.error('[Vault] Error at', new Date().toISOString(), ':', err);
      setError(err.message || 'Failed to load certificates');
    } finally {
      console.log('[Vault] Step 5: Setting loading=false at', new Date().toISOString());
      setLoading(false);
    }
  };

  const handleDelete = async (certId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Quick confirmation (can be replaced with UI modal later)
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
        return;
    }

    try {
        // Optimistic update: Remove from list immediately
        setCertificates(prev => prev.filter(c => c.id !== certId));
        if (selectedCert?.id === certId) setSelectedCert(null);

        await AttestationService.deleteCertificate(certId, session?.access_token);
        console.log('[Vault] Certificate deleted:', certId);
    } catch (err: any) {
        console.error('[Vault] Failed to delete certificate:', err);
        // Revert optimization if failed (optional, but good practice would be to reload)
        alert('Failed to delete certificate');
        loadCertificates(); 
    }
  };

  const handleDownload = (cert: Certificate, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening detail view when clicking download
    
    // If we have a direct PDF URL from storage, use it (Checking if it's a full URL)
    if (cert.pdf_url && (cert.pdf_url.startsWith('http') || cert.pdf_url.startsWith('blob:'))) {
        window.open(cert.pdf_url, '_blank');
        return;
    }

    // Fallback: Generate client-side PDF matching the server one (for resilience)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

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
            {loading ? (
                <div className="h-full flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`mt-4 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Loading vault...</p>
                </div>
            ) : selectedCert ? (
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
                                    <button 
                                      onClick={(e) => handleDelete(cert.id, e)}
                                      className={`p-2 rounded-lg ${isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'} transition-colors`}
                                      title="Delete Certificate"
                                    >
                                        <Trash2 className="w-4 h-4" />
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
                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
                    </div>
                )
            )}
        </div>
        
      </div>
    </div>
  );
}

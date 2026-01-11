import React, { useState } from 'react';
import { PenTool, Shield, FileText, Instagram, Linkedin, Mail } from 'lucide-react';
import LegalModal, { LegalType } from './LegalModal'; // Assumes LegalModal is in same directory

interface FooterSectionProps {
  theme: 'light' | 'dark';
}

const FooterSection: React.FC<FooterSectionProps> = ({ theme }) => {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [activeLegalType, setActiveLegalType] = useState<LegalType>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openLegal = (type: LegalType) => {
    setActiveLegalType(type);
    setLegalModalOpen(true);
  };

  return (
    <footer id="about" className={`relative overflow-hidden pt-20 pb-20 px-6 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-[#1a1a1a] text-white'
    }`}>
      
      {/* Background Typography */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full select-none pointer-events-none overflow-hidden">
        <h1 className="text-[15vw] font-serif font-bold text-center leading-none tracking-tighter whitespace-nowrap bg-gradient-to-r from-white/5 via-[#F2E8CF]/20 to-white/5 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
          INTEGRITY
        </h1>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-2 gap-16 lg:gap-32 mb-20">
          
          {/* Navigation Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-12">
            
            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Product</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-[#F2E8CF] transition-colors text-left">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-[#F2E8CF] transition-colors text-left">Pricing</button></li>
                <li><button onClick={() => scrollToSection('faq')} className="hover:text-[#F2E8CF] transition-colors text-left">FAQ</button></li>
                <li><button onClick={scrollToTop} className="hover:text-[#F2E8CF] transition-colors text-left">About Us</button></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><button onClick={() => openLegal('privacy')} className="hover:text-[#F2E8CF] transition-colors text-left">Privacy Policy</button></li>
                <li><button onClick={() => openLegal('terms')} className="hover:text-[#F2E8CF] transition-colors text-left">Terms of Use</button></li>
                <li><button onClick={() => openLegal('ethics')} className="hover:text-[#F2E8CF] transition-colors text-left">Ethics Policy</button></li>
                <li><button onClick={() => openLegal('security')} className="hover:text-[#F2E8CF] transition-colors text-left">Security</button></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Connect</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><a href="https://www.instagram.com/ichrhin3y/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#F2E8CF] transition-colors"><Instagram className="w-4 h-4" /> Instagram</a></li>
                <li><a href="https://www.linkedin.com/in/rhine-lesther-tague-4b604a246" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#F2E8CF] transition-colors"><Linkedin className="w-4 h-4" /> LinkedIn</a></li>
                <li><a href="mailto:support@thesislens.space" className="flex items-center gap-2 hover:text-[#F2E8CF] transition-colors"><Mail className="w-4 h-4" /> Email</a></li>
              </ul>
            </div>

          </div>

          {/* Minimal Line Art Graphics */}
          <div className="flex items-center justify-center md:justify-end gap-12 opacity-20 hover:opacity-40 transition-opacity duration-500">
            <div className="flex flex-col items-center gap-4">
               <div className="w-[1px] h-16 bg-white/50"></div>
               <PenTool className="w-8 h-8 stroke-[1px]" />
               <div className="w-[1px] h-16 bg-white/50"></div>
            </div>
            <div className="flex flex-col items-center gap-4 mt-12">
               <div className="w-[1px] h-16 bg-white/50"></div>
               <FileText className="w-8 h-8 stroke-[1px]" />
               <div className="w-[1px] h-16 bg-white/50"></div>
            </div>
            <div className="flex flex-col items-center gap-4">
               <div className="w-[1px] h-16 bg-white/50"></div>
               <Shield className="w-8 h-8 stroke-[1px]" />
               <div className="w-[1px] h-16 bg-white/50"></div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
           <p>© 2024 Academic Integrity Agent. All rights reserved.</p>
            <div className="flex gap-8">
               <span>Made with focus.</span>
               <span>Philippines, Davao City</span>
            </div>
         </div>

      </div>

      <LegalModal 
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        type={activeLegalType}
        theme={theme}
      />
    </footer>
  );
};

export default FooterSection;

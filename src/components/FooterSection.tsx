import React from 'react';
import { PenTool, Shield, FileText, Instagram, Github, Mail } from 'lucide-react';

interface FooterSectionProps {
  theme: 'light' | 'dark';
}

const FooterSection: React.FC<FooterSectionProps> = ({ theme }) => {
  return (
    <footer className={`relative overflow-hidden pt-32 pb-12 px-6 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-[#1a1a1a] text-white'
    }`}>
      
      {/* Background Typography */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full select-none pointer-events-none overflow-hidden">
        <h1 className="text-[15vw] font-bold text-center leading-none tracking-tighter whitespace-nowrap bg-gradient-to-r from-white/5 via-[#D2B48C]/20 to-white/5 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer">
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
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">About Us</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Legal</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Terms of Use</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Ethics Policy</a></li>
                <li><a href="#" className="hover:text-[#D2B48C] transition-colors">Security</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-xs font-bold tracking-widest text-gray-500 uppercase">Connect</h4>
              <ul className="space-y-4 text-sm font-medium text-gray-300">
                <li><a href="#" className="flex items-center gap-2 hover:text-[#D2B48C] transition-colors"><Instagram className="w-4 h-4" /> Instagram</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-[#D2B48C] transition-colors"><Github className="w-4 h-4" /> GitHub</a></li>
                <li><a href="#" className="flex items-center gap-2 hover:text-[#D2B48C] transition-colors"><Mail className="w-4 h-4" /> Email</a></li>
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
    </footer>
  );
};

export default FooterSection;

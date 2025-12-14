import React from 'react';
import { Sun, Moon, ArrowRight, Activity, CheckCircle } from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';
import PricingSection from './PricingSection';
import FAQSection from './FAQSection';
import FooterSection from './FooterSection';
import ScrollReveal from './ScrollReveal';

interface LandingPageProps {
  onEnterApp: () => void;
  onLoginClick: () => void;
  onSignUpClick: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onLoginClick, onSignUpClick, theme, toggleTheme }) => {
  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1a1a1a] text-white' : 'bg-[#F5F3EE] text-[#2D2D2D]'
    }`}>
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-30 animate-pulse-slow ${
          theme === 'dark' ? 'bg-[#988165]' : 'bg-[#D2B48C]'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full blur-[100px] opacity-20 animate-float-delayed ${
          theme === 'dark' ? 'bg-[#CC785C]' : 'bg-[#E5AA70]'
        }`} />
      </div>

      {/* Header */}
      <header className="relative z-50 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D2B48C] rounded-xl flex items-center justify-center text-[#2D2D2D] font-bold text-xl shadow-lg">
            A
          </div>
          <span className="font-bold text-lg tracking-tight">Academic Integrity Agent</span>
        </div>
        
        <div className="flex items-center gap-4">
             <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'text-yellow-400 hover:bg-[#333]' : 'text-slate-600 hover:bg-[#E5E3DD]'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className={`h-6 w-px ${theme === 'dark' ? 'bg-[#444]' : 'bg-gray-300'}`}></div>

            <button 
                onClick={onLoginClick}
                className={`px-4 py-2 text-sm font-medium transition-all hover:text-[#D2B48C] relative group ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
                Login
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#D2B48C] transition-all duration-300 group-hover:w-full"></span>
            </button>

            <button 
                onClick={onSignUpClick}
                className="px-5 py-2 text-sm font-bold bg-[#D2B48C] text-[#2D2D2D] rounded-lg shadow-lg hover:shadow-[#D2B48C]/30 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-2">
                Sign Up
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 lg:pt-32 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Text */}
        {/* Left Text */}
        <div className="flex-1 w-full text-center lg:text-left z-20">
            <ScrollReveal>
                <div className="space-y-8"> 
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D2B48C]/30 bg-[#D2B48C]/10 text-[#D2B48C] text-xs font-bold tracking-widest uppercase mb-4 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-[#D2B48C] animate-pulse"></span>
                        System Sync Active
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
                        <span className={theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}>ACADEMIC</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D2B48C] to-[#E5AA70]">
                            INTELLIGENCE
                        </span>
                    </h1>

                    {/* Subhead */}
                    <p className={`text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up [animation-delay:400ms] opacity-0 fill-mode-forwards ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Meet your AI partner for academic synthesis. Auto-fix constraints, generate citations, and standardize your writing flow instantly.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:600ms] opacity-0 fill-mode-forwards">
                        <button 
                            onClick={onEnterApp}
                            className="px-8 py-4 bg-white text-[#2D2D2D] font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group flex items-center justify-center gap-3"
                        >
                            START WRITING
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>

                        <button 
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className={`px-8 py-4 font-bold rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                theme === 'dark' 
                                    ? 'border-[#333] text-white hover:bg-[#333]' 
                                    : 'border-gray-200 text-[#2D2D2D] hover:bg-gray-50'
                            }`}
                        >
                            View Pricing
                        </button>
                    </div>
                </div>
            </ScrollReveal>
        </div>

        {/* Right Visuals (Floating Cards) */}
        <div className="flex-1 w-full relative h-[600px] hidden lg:block">
            {/* Card 1: Perplexity */}
            <div className={`absolute top-10 right-20 w-64 p-5 rounded-2xl border backdrop-blur-md shadow-2xl animate-float transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#252525]/80 border-[#444]' 
                    : 'bg-white/80 border-white'
            }`} style={{ animationDelay: '0s' }}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#D2B48C]" />
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Burstiness</span>
                    </div>
                    <span className="text-[#D2B48C] text-xs font-mono">#B82</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#D2B48C] w-[88%] rounded-full"></div>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-3xl font-bold">88%</span>
                    <span className="text-xs text-[#D2B48C] font-medium">+12% vs avg</span>
                </div>
            </div>

            {/* Card 2: Profile/Status */}
            <div className={`absolute top-[40%] left-10 w-56 p-5 rounded-2xl border backdrop-blur-md shadow-2xl animate-float-delayed z-0 transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#1a1a1a]/90 border-[#333]' 
                    : 'bg-[#F9F9F9]/90 border-gray-200'
            }`} style={{ animationDelay: '1.5s' }}>
                 <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D2B48C] to-[#cc785c] flex items-center justify-center text-white font-bold">
                        AI
                    </div>
                    <div>
                        <div className="text-sm font-bold">Agent Active</div>
                        <div className="text-xs text-[#D2B48C] flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#D2B48C] animate-pulse"></span>
                            Online
                        </div>
                    </div>
                 </div>
                 <div className={`text-xs p-2 rounded bg-opacity-10 ${theme === 'dark' ? 'bg-white' : 'bg-black'} text-opacity-70`}>
                    Optimizing syntax tree...
                 </div>
            </div>

            {/* Card 3: Notifications */}
            <div className={`absolute bottom-20 right-10 w-72 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-float transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#2D2D2D]/90 border-[#444]' 
                    : 'bg-white/95 border-gray-100'
            }`} style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-[#D2B48C]" />
                    <span className="text-sm font-bold">Optimization Complete</span>
                </div>
                <div className={`space-y-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex justify-between">
                        <span>Readability Score</span>
                        <span className="text-[#D2B48C]">98/100</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Originality</span>
                        <span className="text-[#D2B48C]">Pass</span>
                    </div>
                </div>
            </div>

             {/* Connection Lines (Decorative) */}
             <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <path d="M 300 250 Q 400 300 500 150" fill="none" stroke="#D2B48C" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M 200 400 Q 300 500 500 500" fill="none" stroke="#D2B48C" strokeWidth="2" strokeDasharray="5,5" />
             </svg>

        </div>
      </main>

      {/* Feature Showcase Section */}
      <ScrollReveal>
        <FeatureShowcase theme={theme} />
      </ScrollReveal>

      {/* Pricing Section */}
      <ScrollReveal>
        <PricingSection theme={theme} />
      </ScrollReveal>

      {/* FAQ Section */}
      <ScrollReveal>
        <FAQSection theme={theme} />
      </ScrollReveal>

      {/* Footer Section */}
      <ScrollReveal>
        <FooterSection theme={theme} />
      </ScrollReveal>
    </div>
  );
};

export default LandingPage;

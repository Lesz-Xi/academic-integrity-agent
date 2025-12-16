import React from 'react';
import { Sun, Moon, ArrowRight, Sparkles, CheckCircle, BookOpen } from 'lucide-react';
import FeatureShowcase from './FeatureShowcase';
import AlgorithmArchitecture from './AlgorithmArchitecture';

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
          theme === 'dark' ? 'bg-[#988165]' : 'bg-[#F2E8CF]'
        }`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] rounded-full blur-[100px] opacity-20 animate-float-delayed ${
          theme === 'dark' ? 'bg-[#CC785C]' : 'bg-[#E5AA70]'
        }`} />
      </div>

      {/* Header */}
      <header className="relative z-50 pl-4 pr-6 sm:px-6 py-4 sm:py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#F2E8CF] rounded-xl flex items-center justify-center text-[#2D2D2D] font-bold text-lg sm:text-xl shadow-lg flex-shrink-0">
            A
          </div>
          <span className="font-bold text-xs sm:text-lg tracking-tight whitespace-nowrap">Academic Integrity Agent</span>
        </div>
        
        <div className="flex items-center gap-1.5 sm:gap-4">
             <button
              onClick={toggleTheme}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'text-yellow-400 hover:bg-[#333]' : 'text-slate-600 hover:bg-[#E5E3DD]'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 sm:h-5" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
            <div className={`h-4 sm:h-6 w-px ${theme === 'dark' ? 'bg-[#444]' : 'bg-gray-300'}`}></div>

            <button 
                onClick={onLoginClick}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all relative group whitespace-nowrap ${
                theme === 'dark' ? 'text-gray-300 hover:text-[#F2E8CF]' : 'text-gray-600 hover:text-[#85683F]'
            }`}>
                Login
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${
                    theme === 'dark' ? 'bg-[#F2E8CF]' : 'bg-[#85683F]'
                }`}></span>
            </button>

            <button 
                onClick={onSignUpClick}
                className="px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-[#F2E8CF] text-[#2D2D2D] rounded-lg shadow-lg hover:shadow-[#F2E8CF]/30 hover:scale-105 transition-all duration-300 active:scale-95 flex items-center gap-1 sm:gap-2 whitespace-nowrap">
                Sign Up
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
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
                    <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-4">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-widest uppercase animate-fade-in-up ${
                            theme === 'dark' 
                                ? 'border-[#F2E8CF]/30 bg-[#F2E8CF]/10 text-[#F2E8CF]' 
                                : 'border-[#85683F]/30 bg-[#85683F]/10 text-[#85683F]'
                        }`}>
                            <span className={`w-2 h-2 rounded-full animate-pulse ${theme === 'dark' ? 'bg-[#F2E8CF]' : 'bg-[#85683F]'}`}></span>
                            Learning Mode Active
                        </div>
                        
                        {/* Scribbr Trust Badge */}
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-bold tracking-wide animate-fade-in-up [animation-delay:100ms] ${
                            theme === 'dark' 
                                ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400' 
                                : 'border-emerald-600/40 bg-emerald-500/15 text-emerald-700'
                        }`}>
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            0% AI on Scribbr
                        </div>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-[1.1] animate-fade-in-up [animation-delay:200ms] opacity-0 fill-mode-forwards">
                        <span className={theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}>ACADEMIC</span>
                        <br />
                        <span className={theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}>
                            INTELLIGENCE
                        </span>
                    </h1>

                    {/* Subhead */}
                    <p className={`text-lg lg:text-xl leading-relaxed max-w-xl mx-auto lg:mx-0 animate-fade-in-up [animation-delay:400ms] opacity-0 fill-mode-forwards ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        Your intelligent study companion. Master academic writing, synthesize research effortlessly, and develop critical thinking skills.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up [animation-delay:600ms] opacity-0 fill-mode-forwards">
                        <style>
                          {`
                            @keyframes slide-right {
                              0%, 100% { transform: translateX(0); }
                              50% { transform: translateX(5px); }
                            }
                            .group:hover .arrow-icon {
                              animation: slide-right 1s ease-in-out infinite;
                            }
                          `}
                        </style>
                        <button 
                            onClick={onEnterApp}
                            className="px-8 py-4 bg-white text-[#2D2D2D] font-bold rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group flex items-center justify-center gap-3"
                        >
                            START WRITING
                            <ArrowRight className="w-5 h-5 transition-colors group-hover:text-[#C1A278] arrow-icon" />
                        </button>

                        <button 
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className={`px-8 py-4 font-bold rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                                theme === 'dark' 
                                    ? 'border-[#F2E8CF] text-white hover:bg-[#F2E8CF] hover:text-[#2D2D2D]' 
                                    : 'border-[#F2E8CF] text-[#2D2D2D] hover:bg-[#F2E8CF] hover:text-white'
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
            {/* Card 1: AI Reduction */}
            <div className={`absolute top-10 right-20 w-64 p-5 rounded-2xl border backdrop-blur-md shadow-2xl animate-float transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#252525]/80 border-[#444]' 
                    : 'bg-white/80 border-white'
            }`} style={{ animationDelay: '0s' }}>
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-5 h-5 ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`} />
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Writing Enhancement</span>
                    </div>
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>Quality</span>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full w-[85%] rounded-full ${theme === 'dark' ? 'bg-[#F2E8CF]' : 'bg-[#85683F]'}`}></div>
                </div>
                <div className="mt-2 flex justify-between items-end">
                    <span className="text-3xl font-bold">85%</span>
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>Clarity Score</span>
                </div>
            </div>

            {/* Card 2: Before/After */}
            <div className={`absolute top-[40%] left-10 w-64 p-5 rounded-2xl border backdrop-blur-md shadow-2xl animate-float-delayed z-0 transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#1a1a1a]/90 border-[#333]' 
                    : 'bg-[#F9F9F9]/90 border-gray-200'
            }`} style={{ animationDelay: '1.5s' }}>
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                        <BookOpen className={`w-5 h-5 ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`} />
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Learning Progress</span>
                    </div>
                    <span className={`text-xs font-mono ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>Verified</span>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="opacity-60">Comprehension</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>92%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="opacity-60">Citation Quality</span>
                        <span className={`font-bold ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>88%</span>
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`}>Study Aid: Active</span>
                </div>
            </div>

            {/* Card 3: All Detector Results */}
            <div className={`absolute bottom-20 right-10 w-72 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-float transition-colors duration-300 ${
                theme === 'dark' 
                    ? 'bg-[#2D2D2D]/90 border-[#444]' 
                    : 'bg-white/95 border-gray-100'
            }`} style={{ animationDelay: '0.8s' }}>
                <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className={`w-5 h-5 ${theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}`} />
                    <span className="text-sm font-bold">Academic Benefits</span>
                </div>
                <div className={`space-y-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    <div className="flex justify-between">
                        <span>Writing Clarity</span>
                        <span className={theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}>92%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Research Synthesis</span>
                        <span className={theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}>88%</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Critical Analysis</span>
                        <span className={theme === 'dark' ? 'text-[#F2E8CF]' : 'text-[#85683F]'}>85%</span>
                    </div>
                </div>
            </div>

             {/* Connection Lines (Decorative) */}
             <svg className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <path d="M 300 250 Q 400 300 500 150" fill="none" stroke="#F2E8CF" strokeWidth="2" strokeDasharray="5,5" />
                <path d="M 200 400 Q 300 500 500 500" fill="none" stroke="#F2E8CF" strokeWidth="2" strokeDasharray="5,5" />
             </svg>

        </div>
      </main>

      {/* Feature Showcase Section */}
      <ScrollReveal>
        <FeatureShowcase theme={theme} />
      </ScrollReveal>

      {/* Algorithm Architecture Section */}
      <ScrollReveal>
        <AlgorithmArchitecture theme={theme} />
      </ScrollReveal>

      {/* Pricing Section */}
      <ScrollReveal>
        <PricingSection theme={theme} onStartFree={onEnterApp} onLoginRequired={onLoginClick} />
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

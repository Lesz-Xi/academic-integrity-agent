import React, { useState } from 'react';
import { Feather, Terminal, RefreshCw, CheckCircle, Code, MessageSquare, Briefcase, ShieldAlert, ArrowRight } from 'lucide-react';

interface FeatureShowcaseProps {
  theme: 'light' | 'dark';
}

const FeatureShowcase: React.FC<FeatureShowcaseProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: 0,
      title: "Sovereignty Engine",
      description: "Write in our Drafting Canvas. We track every keystroke and generate Proof of Work certificates, proving human authorship to defeat false positive accusations.",
      icon: ShieldAlert,
      color: "#10B981", // Green for verification
      metric: "Verified Human",
      preview: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="text-xs font-mono opacity-60">Drafting Canvas</div>
             <div className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs font-bold">Live</div>
          </div>
          
          {/* Simulated Timeline */}
          <div className={`p-4 rounded-lg text-sm ${theme === 'dark' ? 'bg-[#222]' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
              <span className={`text-xs ${theme === 'dark' ? 'text-green-400' : 'text-green-600'} font-bold`}>SOVEREIGNTY: 94%</span>
            </div>
            <div className="space-y-2 text-xs opacity-70">
              <div className="flex justify-between"><span>11:35 AM</span><span className="text-green-500">+45 chars (Typed)</span></div>
              <div className="flex justify-between"><span>11:33 AM</span><span className="text-red-500">+520 chars (Paste)</span></div>
              <div className="flex justify-between"><span>11:30 AM</span><span className="text-green-500">+89 chars (Typed)</span></div>
            </div>
          </div>

          {/* PDF Button Simulation */}
          <div className={`p-3 rounded-lg border border-dashed flex items-center justify-between ${theme === 'dark' ? 'border-green-900 bg-green-900/20' : 'border-green-200 bg-green-50'}`}>
            <span className="text-xs font-bold text-green-600">Generate Proof of Work PDF</span>
            <ArrowRight className="w-4 h-4 text-green-500" />
          </div>
        </div>
      )
    },
    {
      id: 1,
      title: "Essay & Research",
      description: "Generate original arguments with high semantic richness. Our agent helps develop critical thinking through structured academic writing.",
      icon: Feather,
      color: "#D2B48C",
       metric: "92% Writing Clarity",
      preview: (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-[#D2B48C]/10 text-[#D2B48C] rounded text-xs font-bold">Quality</div>
             <div className="text-xs opacity-60">Writing Clarity • Citation Flow</div>
          </div>
          <div className={`p-4 rounded-lg text-sm leading-relaxed border-l-2 border-[#D2B48C] ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-50'}`}>
            <span className="opacity-50">Input: </span>
            <span className="font-medium">"Analyze the impact of AI on education."</span>
          </div>
          <div className="flex justify-center text-xs opacity-50">↓ Transforming ↓</div>
          <div className={`p-4 rounded-lg text-sm leading-relaxed shadow-sm ${theme === 'dark' ? 'bg-[#252525] text-gray-200' : 'bg-white text-gray-800'}`}>
            <p>
              <span className="bg-[#D2B48C]/20 text-[#D2B48C] px-1 rounded">The integration of artificial intelligence</span> into educational frameworks represents a seismic shift, <span className="underline decoration-wavy decoration-[#D2B48C]/50">fundamentally altering</span> how knowledge is disseminated and assessed.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 2,
      title: "Computer Science",
      description: "Technical documentation and explanation with a conversational, developer-friendly tone. Perfect for logic explanation without the robotic feel.",
      icon: Terminal,
      color: "#D2B48C",
      metric: "Syntax Optimized",
      preview: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="text-xs font-mono opacity-60">algorithm_explanation.md</div>
             <div className="px-2 py-1 bg-[#D2B48C]/10 text-[#D2B48C] rounded text-xs font-bold">Technical Mode</div>
          </div>
          <div className={`p-3 rounded-lg text-xs font-mono overflow-hidden ${theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-[#1e1e1e] text-gray-300'}`}>
            <div className="opacity-50">// Robotic/Standard Output</div>
            <div className="opacity-50 line-through">The function iterates through the array and returns the sum.</div>
            <div className="h-2"></div>
            <div className="text-[#D2B48C]">// Agent Output</div>
            <div>
              So, here's the logic: we're basically walking through the list one item at a time, keeping a running total as we go, and finally spitting out the result.
            </div>
          </div>
           <div className="grid grid-cols-2 gap-2 mt-2">
             <div className={`p-2 rounded text-xs text-center ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-100'}`}>
               Clarity: <span className="text-[#D2B48C]">High</span>
             </div>
             <div className={`p-2 rounded text-xs text-center ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-100'}`}>
                Tone: <span className="text-[#D2B48C]">Casual</span>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Paraphrase & Humanize",
      description: "Deep syntactic restructuring for existing text. We don't just swap synonyms; we rebuild the sentence logic entirely.",
      icon: RefreshCw,
      color: "#E5AA70",
      metric: "85% Clarity Improvement",
      preview: (
         <div className="space-y-4">
           {/* "Bad" / AI State - Using Stone/Gray to contrast with Creme */}
           <div className={`relative p-4 rounded-lg text-sm border dashed border-gray-300/50 ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50'}`}>
              <div className={`absolute -top-2 -right-2 text-[10px] px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>Stiff Writing</div>
             <p className="opacity-60 line-through decoration-gray-400">In conclusion, it can be stated that the evidence supports the hypothesis.</p>
           </div>
           
           <div className="flex items-center gap-2 justify-center">
              <div className="h-8 w-px bg-[#D2B48C]/30"></div>
           </div>

           {/* "Good" / Humanized State - Using Brand Creme */}
           <div className={`relative p-4 rounded-lg text-sm border border-[#D2B48C]/30 ${theme === 'dark' ? 'bg-[#D2B48C]/5' : 'bg-[#D2B48C]/10'}`}>
               <div className="absolute -top-2 -right-2 bg-[#D2B48C] text-[#2D2D2D] text-[10px] px-2 py-0.5 rounded-full font-bold">Natural Flow</div>
              <p className="font-medium">All things considered, the data backs up our initial guess quite nicely.</p>
           </div>
         </div>
      )
    },
    {
      id: 4,
      title: "Casual Mode",
      description: "Authentic Student Voice. Preserves natural linguistic patterns and genuine expression, ensuring your work reflects your true understanding and original thought.",
      icon: MessageSquare,
      color: "#D2B48C",
      metric: "Human-Grade Flow",
      preview: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="text-xs font-mono opacity-60">Persona: Student</div>
             <div className="px-2 py-1 bg-[#D2B48C]/20 text-[#D2B48C] rounded text-xs font-bold">Authentic</div>
          </div>
          <div className={`p-4 rounded-lg text-sm leading-relaxed border-l-2 border-[#D2B48C] ${theme === 'dark' ? 'bg-[#252525] text-gray-200' : 'bg-white text-gray-800'}`}>
            <p>
              Honestly, I kinda think the whole premise is broken. Like, why are we even optimized for this? It just feels weird.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
             <div className={`p-2 rounded text-xs text-center ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-100'}`}>
               Score: <span className="text-[#D2B48C]">Original</span>
             </div>
             <div className={`p-2 rounded text-xs text-center ${theme === 'dark' ? 'bg-[#333]' : 'bg-gray-100'}`}>
                Style: <span className="text-[#D2B48C]">Natural</span>
             </div>
           </div>
        </div>
      )
    },
    {
      id: 5,
      title: "Professional Mode",
      description: "Apple-Style Corporate Polish. Dense, concise, and grammatically perfect without being robotic. Removes fluff and enhances authority.",
      icon: Briefcase,
      color: "#6B7280",
      metric: "Executive Ready",
      preview: (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
             <div className="text-xs font-mono opacity-60">Style: Corporate</div>
             <div className="px-2 py-1 bg-gray-500/10 text-gray-500 rounded text-xs font-bold">High Density</div>
          </div>
          <div className={`p-4 rounded-lg text-sm leading-relaxed border-l-2 border-gray-400 ${theme === 'dark' ? 'bg-[#252525] text-gray-200' : 'bg-white text-gray-800'}`}>
            <p>
              The premise appears fundamentally flawed. Optimization for this metric yields diminishing returns and misaligns with core objectives.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 justify-center text-xs opacity-50">
             <CheckCircle className="w-3 h-3" /> No Fluff
             <CheckCircle className="w-3 h-3" /> Passive Voice
          </div>
        </div>
      )
    },
    {
      id: 6,
      title: "Defense & Appeal",
      description: "Generate scientifically rigorous appeal packets backed by internal research (Lesz et al.). Cite specific false-positive vectors to defend your sovereignty.",
      icon: ShieldAlert,
      color: "#CC785C",
      metric: "Due Process Enforced",
      preview: (
        <div className="space-y-4">
           {/* Header Simulation */}
           <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-mono opacity-60">Action: Appeal</div>
              <div className="px-2 py-1 bg-red-100 text-red-600 rounded text-xs font-bold">Scientific Defense</div>
           </div>

           {/* Input Simulation */}
           <div className={`p-3 rounded-lg border border-dashed mb-2 ${theme === 'dark' ? 'border-gray-700 bg-[#222]' : 'border-gray-200 bg-gray-50'}`}>
               <div className="flex justify-between text-xs mb-1 opacity-50">
                   <span>Detector: GPTZero</span>
                   <span>Score: 40% (False Positive)</span>
               </div>
               <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                   <div className="h-full w-[40%] bg-red-400"></div>
               </div>
           </div>

           {/* Generated Output */}
           <div className={`p-4 rounded-lg text-sm leading-relaxed shadow-sm ${theme === 'dark' ? 'bg-[#252525] text-gray-200' : 'bg-white text-gray-800'}`}>
             <p className="font-serif">
                "I respectfully appeal this flag. My work utilizes high-perplexity academic structures which research (Lesz et al., 2023) proves triggers false positives in commercial detectors."
             </p>
             <div className="mt-2 flex items-center gap-2 text-[10px] text-[#CC785C] font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3" /> Citation Attached
             </div>
           </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className={`py-20 px-6 relative overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#111]' : 'bg-[#F5F3EE]' // Seamless blend with global background
    }`}>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
           <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Plan, write, and ship <br className="hidden md:block" />
            <span className={`${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
               work that matters
            </span>
           </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          
          {/* Left Column: Navigation Tabs */}
          <div className="flex flex-col gap-2 relative">


             {features.map((feature, index) => (
                <button
                  key={feature.id}
                  onClick={() => {
                    setActiveTab(index);
                  }}
                  className={`text-left pl-8 pr-4 transition-all duration-200 group ${
                    activeTab === index 
                        ? 'py-6 opacity-100' 
                        : 'py-4 opacity-40 hover:opacity-70'
                  }`}
                >
                  <h3 className={`text-xl font-bold mb-2 flex items-center gap-3 transition-colors duration-200 ${
                     activeTab === index 
                        ? (theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]') 
                        : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                  }`}>
                    {activeTab === index && <span className="w-2 h-2 rounded-full bg-[#D2B48C] animate-pulse" />}
                    {feature.title}
                  </h3>
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-out ${
                      activeTab === index ? 'max-h-48 opacity-100 py-2' : 'max-h-0 opacity-0 py-0'
                    }`}
                    style={{ transform: 'translateZ(0)' }} // GPU acceleration for accordion
                  >
                    <p className={`text-sm leading-relaxed max-w-md ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                        {feature.description}
                    </p>

                    {/* Mobile Only: Inline Preview */}
                    <div className="lg:hidden mt-4">
                       <div className={`rounded-xl border border-dashed overflow-hidden ${theme === 'dark' ? 'border-[#333]' : 'border-gray-200'}`}>
                           <div className="w-full">
                              {feature.preview}
                           </div>
                       </div>
                    </div>
                  </div>
                </button>
             ))}
          </div>

          {/* Right Column: Preview Area (Desktop Only) */}
          <div className="relative hidden lg:block">
             <div className={`relative rounded-3xl border shadow-2xl overflow-hidden min-h-[550px] transition-colors duration-500 ${
                theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-white border-gray-100'
             }`}>
                
                {/* Window Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${
                   theme === 'dark' ? 'border-[#333]' : 'border-gray-100'
                }`}>
                   <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                         theme === 'dark' ? 'bg-[#333]' : 'bg-gray-100'
                      }`}>
                         {React.createElement(features[activeTab].icon, { 
                            className: "w-5 h-5",
                            color: features[activeTab].color 
                         })}
                      </div>
                      <div className="text-sm font-medium">Feature Preview</div>
                   </div>
                   
                   <div className="flex gap-1.5 opacity-50">
                      <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/10'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/10'}`}></div>
                      <div className={`w-3 h-3 rounded-full ${theme === 'dark' ? 'bg-white/20' : 'bg-black/10'}`}></div>
                   </div>
                </div>

                {/* Background Glow - Moved behind content */}
                <div 
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-[100px] opacity-10 pointer-events-none transition-colors duration-1000 z-0"
                  style={{ 
                      backgroundColor: features[activeTab].color,
                      transform: 'translate3d(-50%, -50%, 0)' // Force HW acceleration to fix iOS flicker
                  }}
                />

                {/* Content Area */}
                <div className="p-8 h-full flex flex-col relative z-10">
                   <div className="flex-grow flex items-center justify-center">
                      <div key={activeTab} className="w-full animate-fade-in-up">
                         {features[activeTab].preview}
                      </div>
                   </div>

                   {/* Footer Info */}
                   <div className={`mt-8 pt-6 border-t flex justify-between items-center ${
                      theme === 'dark' ? 'border-[#333]' : 'border-gray-100'
                   }`}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#D2B48C]" />
                        <span className="text-sm font-medium">{features[activeTab].metric}</span>
                      </div>
                      <button className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                         theme === 'dark' 
                            ? 'border-[#444] hover:bg-[#333]' 
                            : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                         Live Demo
                      </button>
                   </div>
                </div>
             </div>

             {/* floating badge - Hidden on mobile */}
            <div className={`hidden md:block absolute -right-4 top-10 p-3 rounded-xl shadow-lg border backdrop-blur-md animate-float ${
                theme === 'dark' ? 'bg-[#252525]/90 border-[#444]' : 'bg-white/90 border-gray-200'
            }`}>
                <div className="flex items-center gap-3">
                    <div className="bg-[#D2B48C] p-2 rounded-lg">
                        <Code className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <div className="text-xs font-bold">Mode Switch</div>
                        <div className="text-[10px] opacity-70">Seamless Transition</div>
                    </div>
                </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase;

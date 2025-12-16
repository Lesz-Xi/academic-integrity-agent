import React, { useState, useEffect } from 'react';
import { Search, GitBranch, Zap, CheckCircle } from 'lucide-react';

interface AlgorithmArchitectureProps {
  theme: 'light' | 'dark';
}

const AlgorithmArchitecture: React.FC<AlgorithmArchitectureProps> = ({ theme }) => {
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through steps for the visualization
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    {
      id: 0,
      title: "Context Analysis",
      description: "We decode the semantic structure, analyzing perplexity and burstiness to establish the project's constraints.",
      icon: Search,
      label: "01. ANALYZE"
    },
    {
      id: 1,
      title: "Smart Source Selection",
      description: "Monte Carlo Tree Search intelligently evaluates and ranks research sources for informativeness, relevance, and authority.",
      icon: GitBranch,
      label: "02. SELECT"
    },
    {
      id: 2,
      title: "Entropy Engineering",
      description: "Synthesizing varied sentence structures to mirror natural human writing patterns using advanced linguistic harmony.",
      icon: Zap,
      label: "03. ENGINEER"
    },
    {
      id: 3,
      title: "Verified Output",
      description: "Delivering an authentically synthesized artifact that preserves original intent and meets the highest standards of integrity.",
      icon: CheckCircle, // This might need a fix if CheckCircle isn't exported directly like this
      label: "04. SYNTHESIZE"
    }
  ];

  return (
    <section className={`py-32 px-6 overflow-hidden transition-colors duration-500 ${
      theme === 'dark' ? 'bg-black text-white' : 'bg-[#F5F3EE] text-[#2D2D2D]'
    }`}>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        
        {/* Left: 3D Visualization */}
        <div className="relative h-[600px] flex items-center justify-center perspective-[1000px]">
          {/* Background Glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full blur-[100px] animate-pulse-slow pointer-events-none transition-colors duration-500 ${
            theme === 'dark' ? 'bg-[#D2B48C]/10' : 'bg-[#D2B48C]/20'
          }`} />

          {/* The Stack */}
          <div className="relative transform-style-3d rotate-x-60 rotate-z-45 duration-700 transition-transform">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-64 rounded-2xl border backdrop-blur-sm transition-all duration-700 ease-in-out flex items-center justify-center ${
                  index === activeStep 
                    ? 'border-[#D2B48C] shadow-[0_0_50px_rgba(210,180,140,0.3)] translate-z-[100px] scale-105' 
                    : theme === 'dark' 
                        ? 'border-white/10 bg-black/40 grayscale opacity-40 hover:opacity-100'
                        : 'border-black/5 bg-white/40 grayscale opacity-40 hover:opacity-100'
                } ${
                    index === activeStep && theme === 'dark' ? 'bg-black/90' : ''
                } ${
                    index === activeStep && theme === 'light' ? 'bg-[#F5F3EE]/90' : ''
                }`}
                style={{
                  transform: `translate(-50%, -50%) translateZ(${index === activeStep ? 240 : index * 60}px)`,
                  zIndex: index === activeStep ? 50 : index
                }}
              >
                {/* Layer Label/Connector */}
                <div className={`absolute -left-12 top-1/2 -translate-y-1/2 flex items-center gap-4 transition-all duration-300 ${
                    index === activeStep ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'
                }`}>
                    <div className={`text-xs font-mono font-bold whitespace-nowrap w-40 py-1.5 flex justify-start items-center pl-4 rounded-full border border-[#D2B48C]/50 ${
                         theme === 'dark' ? 'text-[#D2B48C] bg-black/80' : 'text-[#85683F] bg-white/80'
                    }`}>
                        {step.label}
                    </div>
                    <div className="w-12 h-px bg-[#D2B48C]"></div>
                </div>

                <step.icon className={`w-24 h-24 stroke-[1px] transition-opacity duration-300 ${
                    index === activeStep ? 'text-[#D2B48C] opacity-100' : 'text-gray-500 opacity-0'
                }`} />
              </div>
            ))}
            
            {/* Axis Line */}
            <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-[400px] bg-gradient-to-b from-transparent via-[#D2B48C]/50 to-transparent transform-style-3d -translate-z-20`} />
          </div>

        </div>

        {/* Right: Content Steps */}
        <div className="space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter">
              From Draft <br />
              <span className="invisible">Fro</span>
              <span className="text-[#85683F] opacity-50">to Integrity</span>
            </h2>
            <p className={`text-lg max-w-md ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              We strip away the unnecessary, focusing on structural purity and parametric efficiency to deliver timeless monuments of text.
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div 
                key={step.id}
                className={`group flex items-start gap-6 transition-all duration-500 cursor-pointer ${
                    activeStep === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div className={`mt-1 p-3 rounded-full border transition-all duration-500 ${
                    activeStep === index 
                        ? 'border-[#D2B48C] bg-[#D2B48C]/10' 
                        : (theme === 'dark' ? 'border-white/10 bg-transparent' : 'border-black/5 bg-transparent')
                }`}>
                    <step.icon className={`w-5 h-5 ${
                        activeStep === index ? 'text-[#D2B48C]' : (theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]')
                    }`} />
                </div>
                <div>
                   <h3 className={`text-xl font-bold mb-1 ${
                       activeStep === index ? (theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-500')
                   }`}>
                       {step.title}
                   </h3>
                   <p className={`leading-relaxed max-w-sm text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                       {step.description}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default AlgorithmArchitecture;

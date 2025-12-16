import React from 'react';
import { Quote } from 'lucide-react';

interface TestimonialsSectionProps {
  theme: 'light' | 'dark';
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ theme }) => {
  return (
    <section className={`py-24 px-6 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#F5F3EE]'
    }`}>
      <div className="max-w-4xl mx-auto relative">
        {/* Quote Icon */}
        <div className="mb-8">
            <Quote 
                className={`w-12 h-12 rotate-180 ${
                    theme === 'dark' ? 'text-[#F2E8CF] opacity-80' : 'text-[#85683F] opacity-100'
                }`} 
                fill="currentColor"
            />
        </div>

        {/* Quote Text */}
        <blockquote className={`text-2xl md:text-4xl font-medium leading-tight mb-12 ${
          theme === 'dark' ? 'text-gray-200' : 'text-[#2D2D2D]'
        }`}>
          "Integrity is not just what you write, but how you synthesize it. Our intelligent infrastructure powers the future of ethical academic research."
        </blockquote>

        {/* Author Info */}
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
            theme === 'dark' ? 'bg-[#333] text-white' : 'bg-[#E5AA70] text-[#2D2D2D]'
          }`}>
            JD
          </div>
          <div>
            <div className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
              Julian Davis
            </div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Head of Ethics, Archetype Univ.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

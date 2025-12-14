import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQSectionProps {
  theme: 'light' | 'dark';
}

const FAQSection: React.FC<FAQSectionProps> = ({ theme }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Is the output detectable by AI detectors like Turnitin?",
      answer: "Our agent is specifically engineered to maximize 'burstiness' and 'perplexity' metrics. By varying sentence structures and choosing semantically rich vocabulary, it creates content that mimics natural human writing patterns, significantly reducing the likelihood of AI detection."
    },
    {
      question: "Is using this tool considered academic misconduct?",
      answer: "This tool is designed as an educational writing assistant to help you improve your syntax and vocabulary. We strictly advise against submitting AI-generated content as your own work without citation. Always use it to refine your own ideas and follow your institution's academic integrity policies."
    },
    {
      question: "Does it work for technical CS assignments?",
      answer: "Yes! Our 'Computer Science' mode is fine-tuned for technical documentation, code comments, and logic explanations. It adopts a more conversational, developer-to-developer tone rather than the stiff, robotic output often associated with standard LLMs."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Absolutely. You can manage your subscription directly from your dashboard and cancel whenever you like. You'll keep access to your plan's features until the end of your current billing cycle."
    }
  ];

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className={`py-24 px-6 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#F9F9F9]'
    }`}>
      <div className="max-w-3xl mx-auto">
        <h2 className={`text-3xl md:text-4xl font-bold text-center mb-12 tracking-tight ${
          theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'
        }`}>
          Common Queries
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-200 bg-white'
              } ${openIndex === index ? 'shadow-lg ring-1 ring-[#D2B48C]/50' : ''}`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
              >
                <span className={`text-lg font-medium pr-8 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-[#2D2D2D]'
                }`}>
                  {faq.question}
                </span>
                <div className={`p-1 rounded-full border transition-colors duration-300 ${
                    openIndex === index 
                        ? 'bg-[#D2B48C] border-[#D2B48C] text-white' 
                        : (theme === 'dark' ? 'border-[#444] text-gray-400' : 'border-gray-200 text-gray-400')
                }`}>
                    {openIndex === index ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </div>
              </button>
              
              <div 
                className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                    openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                    <p className={`px-6 pb-6 text-sm leading-relaxed ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {faq.answer}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Support Link */}
        <div className={`mt-12 text-center text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
            Still have questions? <button className="text-[#D2B48C] font-medium hover:underline">Chat with us</button>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;

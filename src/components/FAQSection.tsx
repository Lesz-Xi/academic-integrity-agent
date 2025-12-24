import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

interface FAQSectionProps {
  theme: 'light' | 'dark';
}

const FAQSection: React.FC<FAQSectionProps> = ({ theme }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "How can I prove I wrote this myself?",
      answer: "Use our Drafting Canvas. We track your writing process—keystrokes, edits, and time spent—to generate a 'Certificate of Sovereignty.' This verifiable PDF proves your human effort, distinguishing your work from generated text."
    },
    {
      question: "How does the agent preserve my academic voice?",
      answer: "Our system is engineered for 'Ethical Synthesis', prioritizing your original intent. By enhancing your existing drafts with varied sentence structures and precise vocabulary, it helps clarify your arguments without replacing your unique perspective or critical thinking."
    },
    {
      question: "How does this tool foster the learning process?",
      answer: "Think of it as an intelligent writing mentor. It helps you overcome writer's block and understand advanced syntactic patterns. You maintain full control over the output, using the suggestions to learn how to articulate complex ideas more effectively."
    },
    {
      question: "How does the Essay mode differ from standard AI?",
      answer: "Unlike generic chatbots, our Essay engine is grounded in academic rigor. It prioritizes logical argumentation and structural depth over surface-level fluency, ensuring your essays have the weight and complexity of a researched paper."
    },
    {
      question: "Will paraphrasing change the meaning of my work?",
      answer: "Our 'Semantic Fidelity' technology ensures your original meaning is perfectly preserved. The agent focuses on enhancing flow, vocabulary, and 'burstiness' (sentence variation) without altering your core arguments or factual data."
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
    <section id="faq" className={`py-16 px-6 transition-colors duration-500 ${
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
                openIndex === index
                  ? `border-[#F2E8CF] ${theme === 'dark' ? 'bg-[#222]' : 'bg-white'}`
                  : (theme === 'dark' ? 'border-[#333] bg-[#222]' : 'border-gray-200 bg-white')
              } ${openIndex === index ? 'shadow-lg shadow-[#F2E8CF]/10' : ''}`}
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
                        ? 'bg-[#F2E8CF] border-[#F2E8CF] text-[#2D2D2D]' 
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
            Still have questions? <a href="mailto:support@thesislens.space" className="text-[#F2E8CF] font-medium hover:underline">Chat with us</a>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;

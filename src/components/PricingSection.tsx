import React, { useState } from 'react';
import { Check, Sparkles, Building2, Zap } from 'lucide-react';

interface PricingSectionProps {
  theme: 'light' | 'dark';
}

const PricingSection: React.FC<PricingSectionProps> = ({ theme }) => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: 'hobby',
      name: 'Hobby',
      price: 0,
      description: 'Perfect for trying out the agent.',
      features: [
        '3 Document Generations / mo',
        'Basic Burstiness Analysis',
        'Standard Humanization',
        'Community Support'
      ],
      cta: 'Start Creating',
      icon: Zap,
      highlight: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: isAnnual ? 12 : 15,
      description: 'For students who need consistent results.',
      features: [
        'Unlimited Generations',
        'Advanced Syntax Optimization',
        'Deep "Humanize" Mode',
        'Priority Processing',
        'Export to PDF/Docx'
      ],
      cta: 'Upgrade to Pro',
      icon: Sparkles,
      highlight: true
    },
    {
      id: 'teams',
      name: 'Teams',
      price: 'Custom',
      description: 'For institutions and research groups.',
      features: [
        'Organization Management',
        'SSO & SAML Auth',
        'Analytics Dashboard',
        'Dedicated API Access',
        '24/7 Dedicated Support'
      ],
      cta: 'Contact Sales',
      icon: Building2,
      highlight: false
    }
  ];

  return (
    <section id="pricing" className={`py-24 px-6 transition-colors duration-500 ${
      theme === 'dark' ? 'bg-[#111]' : 'bg-[#fff]'
    }`}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${
            theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'
          }`}>
            Pricing Plans
          </h2>
          <p className={`text-lg max-w-2xl mx-auto ${
             theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Invest in your academic integrity. Simple, transparent pricing.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium ${!isAnnual ? (theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]') : 'opacity-50'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                isAnnual ? 'bg-[#D2B48C]' : (theme === 'dark' ? 'bg-[#333]' : 'bg-gray-200')
              }`}
            >
              <div className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
            <span className={`text-sm font-medium flex items-center gap-2 ${isAnnual ? (theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]') : 'opacity-50'}`}>
              Annual
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D2B48C]/20 text-[#D2B48C] font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                plan.highlight 
                  ? `border-2 border-[#D2B48C] shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1a] shadow-[#D2B48C]/10' : 'bg-white shadow-[#D2B48C]/20'}`
                  : `border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#F9F9F9] border-gray-100'}`
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 right-0 p-4">
                  <span className="px-3 py-1 rounded-full bg-[#D2B48C] text-[#2D2D2D] text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Popular
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-bold ${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
                    {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                  </span>
                  {typeof plan.price === 'number' && (
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      /{isAnnual ? 'mo' : 'mo'}
                    </span>
                  )}
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan.description}
                </p>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className={`p-0.5 rounded-full ${
                      plan.highlight ? 'bg-[#D2B48C] text-black' : (theme === 'dark' ? 'bg-[#333] text-gray-400' : 'bg-gray-200 text-gray-600')
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                plan.highlight
                  ? 'bg-[#D2B48C] text-[#2D2D2D] hover:bg-[#C1A278] hover:shadow-lg hover:shadow-[#D2B48C]/30'
                  : `border ${theme === 'dark' ? 'border-[#333] text-white hover:bg-[#333]' : 'border-gray-200 text-[#2D2D2D] hover:bg-gray-50'}`
              }`}>
                {plan.cta}
              </button>

            </div>
          ))}
        </div>

        <div className={`mt-12 text-center text-xs font-mono opacity-50 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
          Open source via <span className="underline">Apache 2.0</span> license for non-commercial use.
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

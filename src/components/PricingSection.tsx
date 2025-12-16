import React, { useState } from 'react';
import { Check, Sparkles, Zap } from 'lucide-react';
import CheckoutModal from './CheckoutModal';
import { useAuth } from '../contexts/AuthContext';

interface PricingSectionProps {
  theme: 'light' | 'dark';
  onSelectPlan?: (planId: string) => void;
  onStartFree?: () => void;
  onLoginRequired?: () => void;  // Add callback for login
}

type BillingCycle = 'monthly' | 'quarterly' | 'annual';

const PricingSection: React.FC<PricingSectionProps> = ({ theme, onSelectPlan, onStartFree, onLoginRequired }) => {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('annual');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    price: number;
  } | null>(null);

  // Pricing: Monthly = $12, Quarterly = $10/mo, Annual = $8/mo
  const getPremiumPrice = () => {
    switch (billingCycle) {
      case 'monthly': return 12;
      case 'quarterly': return 10;
      case 'annual': return 8;
    }
  };

  const getSavingsText = () => {
    switch (billingCycle) {
      case 'monthly': return null;
      case 'quarterly': return 'Save 17%';
      case 'annual': return 'Save 33%';
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Get started with core features.',
      features: [
        '20 Generations per month',
        'All 3 Modes (Essay, CS, Paraphrase)',
        'Basic Humanization',
        'Burstiness Analysis'
      ],
      cta: 'Start Free',
      icon: Zap,
      highlight: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: getPremiumPrice(),
      description: 'For students who need the best results.',
      features: [
        'Unlimited Generations',
        'Web Search Integration',
        'Advanced Perplexity Optimization',
        'Priority Model Access (Claude)',
        'Email Support'
      ],
      cta: 'Go Premium',
      icon: Sparkles,
      highlight: true
    }
  ];

  const handlePlanClick = (plan: typeof plans[0]) => {
    if (plan.id === 'free') {
      // Free plan - trigger start free callback
      onStartFree?.();
      onSelectPlan?.(plan.id);
      return;
    }
    
    // Premium plan - check if user is logged in
    if (!user) {
      // User not logged in - prompt to sign in and save intent
      console.log('[PricingSection] User not logged in, prompting login');
      
      // Save intent to subscribe after login
      localStorage.setItem('pendingSubscription', 'premium');
      
      if (onLoginRequired) {
        onLoginRequired();
      } else {
        alert('Please sign in to subscribe to Premium.');
      }
      return;
    }
    
    // Premium plan - open checkout
    setSelectedPlan({
      id: plan.id,
      name: plan.name,
      price: plan.price
    });
    setCheckoutOpen(true);
  };

  const handleCheckoutSuccess = () => {
    console.log('[PricingSection] Checkout successful');
    onSelectPlan?.('premium');
    setCheckoutOpen(false);
  };

  const billingOptions: { value: BillingCycle; label: string }[] = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annual', label: 'Annual' }
  ];

  return (
    <>
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

            {/* Billing Cycle Selector */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <div className={`inline-flex rounded-xl p-1 ${
                theme === 'dark' ? 'bg-[#252525]' : 'bg-gray-100'
              }`}>
                {billingOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBillingCycle(option.value)}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      billingCycle === option.value
                        ? 'bg-[#F2E8CF] text-[#2D2D2D] shadow-md'
                        : theme === 'dark' 
                          ? 'text-gray-400 hover:text-white' 
                          : 'text-gray-500 hover:text-[#2D2D2D]'
                    }`}
                  >
                    {option.label}
                    {option.value === 'annual' && (
                      <span className="absolute -top-2 -right-2 text-[8px] px-1.5 py-0.5 rounded-full bg-green-500 text-white font-bold">
                        BEST
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {getSavingsText() && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-bold ml-2 ${
                  theme === 'dark' 
                    ? 'bg-[#F2E8CF]/20 text-[#F2E8CF]' 
                    : 'bg-[#85683F]/10 text-[#85683F]'
                }`}>
                  {getSavingsText()}
                </span>
              )}
            </div>
          </div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                  plan.highlight 
                    ? `border-2 border-[#F2E8CF] shadow-2xl ${theme === 'dark' ? 'bg-[#1a1a1a] shadow-[#F2E8CF]/10' : 'bg-white shadow-[#F2E8CF]/20'}`
                    : `border ${theme === 'dark' ? 'bg-[#1a1a1a] border-[#333]' : 'bg-[#F9F9F9] border-gray-100'}`
                }`}
              >
                {plan.highlight && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="px-3 py-1 rounded-full bg-[#F2E8CF] text-[#2D2D2D] text-xs font-bold flex items-center gap-1">
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
                      ${plan.price}
                    </span>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      /mo
                    </span>
                  </div>
                  <p className={`mt-4 text-sm leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <div className={`p-0.5 rounded-full ${
                        plan.highlight ? 'bg-[#F2E8CF] text-black' : (theme === 'dark' ? 'bg-[#333] text-gray-400' : 'bg-gray-200 text-gray-600')
                      }`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => handlePlanClick(plan)}
                  className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                    plan.highlight
                      ? 'bg-[#F2E8CF] text-[#2D2D2D] hover:bg-[#C1A278] hover:shadow-lg hover:shadow-[#F2E8CF]/30'
                      : `border ${theme === 'dark' ? 'border-[#333] text-white hover:bg-[#C1A278] hover:text-[#2D2D2D]' : 'border-gray-200 text-[#2D2D2D] hover:bg-[#C1A278] hover:text-[#2D2D2D] hover:border-[#C1A278]'}`
                  }`}
                >
                  {plan.cta}
                </button>

              </div>
            ))}
          </div>

          <div className={`mt-12 text-center text-xs font-mono ${theme === 'dark' ? 'text-gray-500' : 'text-[#85683F]/80'}`}>
            Open source via <span className="underline">Apache 2.0</span> license for non-commercial use.
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {selectedPlan && (
        <CheckoutModal
          isOpen={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          theme={theme}
          planId="premium"
          planName={selectedPlan.name}
          planPrice={selectedPlan.price}
          billingCycle={billingCycle}
          onSuccess={handleCheckoutSuccess}
        />
      )}
    </>
  );
};

export default PricingSection;



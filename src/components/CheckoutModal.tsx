import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Sparkles, Wallet, CreditCard } from 'lucide-react';
import { loadPayPalScript } from '../services/paypalService';

import { useAuth } from '../contexts/AuthContext';
import { createPaymentLink, calculateAmountCentavos, getPlanDescription } from '../services/paymongoService';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  planId: 'premium';
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  onSuccess: () => void;
}

type PaymentMethod = 'paypal' | 'gcash';

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  theme,
  planName,
  planPrice,
  billingCycle,
  onSuccess
}) => {
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'quarterly' | 'annual'>(
    (billingCycle === 'annual') ? 'annual' : (billingCycle === 'quarterly') ? 'quarterly' : 'monthly'
  );
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [isProcessingGcash, setIsProcessingGcash] = useState(false);
  const [_isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setAgreedToTerms(false);
      setPaypalLoaded(false);
      // Reset to prop or default
      setSelectedBillingCycle(billingCycle === 'annual' ? 'annual' : billingCycle === 'quarterly' ? 'quarterly' : 'monthly');
    }
  }, [isOpen, billingCycle]);

  // Load PayPal SDK when modal opens
  useEffect(() => {
    if (isOpen && !window.paypal) {
      loadPayPalScript()
        .then(() => {
          console.log('[PayPal] SDK loaded successfully');
          setPaypalLoaded(true);
        })
        .catch(err => console.error('[PayPal] Failed to load SDK:', err));
    } else if (window.paypal && isOpen) {
      setPaypalLoaded(true);
    }
  }, [isOpen]);

  const calculateAmount = () => {
    // Annual: $80 (10 months)
    // Quarterly: $24 (3 months - no discount standard, or slight? Let's keep transparent flat x3 for now)
    // Monthly: $8
    
    if (selectedBillingCycle === 'annual') {
      return (planPrice * 10).toFixed(2);
    }
    if (selectedBillingCycle === 'quarterly') {
      return (planPrice * 3).toFixed(2);
    }
    return planPrice.toFixed(2);
  };

  // Handle GCash payment via PayMongo
  const handleGcashPayment = async () => {
    if (!user || !agreedToTerms) return;

    setIsProcessingGcash(true);
    
    try {
      console.log('[GCash] Creating payment link...');
      
      const { checkoutUrl } = await createPaymentLink({
        userId: user.id,
        plan: 'premium',
        billingCycle: selectedBillingCycle,
        amount: calculateAmountCentavos(planPrice, selectedBillingCycle),
        description: getPlanDescription(selectedBillingCycle),
      });

      console.log('[GCash] Redirecting to:', checkoutUrl);
      
      // Redirect to PayMongo checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('[GCash] Payment error:', error);
      alert('Failed to create payment. Please try again.');
      setIsProcessingGcash(false);
    }
  };

  const renderPayPalButton = React.useCallback(() => {
    if (!window.paypal || !paypalRef.current) {
      console.log('[PayPal] Not ready:', { paypal: !!window.paypal, ref: !!paypalRef.current });
      return;
    }

    console.log('[PayPal] Rendering button...');
    
    // Clear existing button
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'paypal'
      },
      createOrder: (_data: any, actions: any) => {
        const descMap = {
          monthly: 'Monthly',
          quarterly: 'Quarterly (3 Months)',
          annual: 'Annual (12 Months)'
        };

        return actions.order.create({
          purchase_units: [{
            description: `${planName} - ${descMap[selectedBillingCycle]}`,
            amount: {
              currency_code: 'USD',
              value: calculateAmount()
            }
          }]
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          setIsProcessing(true);
          const details = await actions.order.capture();
          console.log('[PayPal] Payment successful:', details);
          
          const currentUser = user;
          const currentBillingCycle = selectedBillingCycle;
          
          setTimeout(async () => {
             // ... existing success logic ...
            console.log('[PayPal] User object:', currentUser);
            if (currentUser) {
              console.log('[PayPal] Verifying payment for user:', currentUser.id);
              try {
                // Secure server-side verification
                await import('../services/paypalService').then(m => 
                  m.verifyPayPalOrder(details.id, currentBillingCycle)
                );
                console.log('[PayPal] Payment verified and subscription updated');
              } catch (error) {
                console.error('[PayPal] Failed to verify payment:', error);
                alert('Payment verification failed. Please contact support.');
                setIsProcessing(false);
                return;
              }
            } else {
              console.error('[PayPal] No user found - cannot verify payment');
              alert('Payment succeeded but user not authenticated. Please log in and contact support.');
            }
            
            setIsProcessing(false);
            setIsSuccess(true);
            
            setTimeout(() => {
              onSuccess();
              onClose();
            }, 1500);
          }, 0);
          
          return details;
        } catch (error) {
          console.error('[PayPal] Payment capture failed:', error);
          setIsProcessing(false);
          alert('Payment failed. Please try again.');
          throw error;
        }
      },
      onError: (err: any) => {
        console.error('[PayPal] Payment error:', err);
        setIsProcessing(false);
        alert('Payment error. Please try again.');
      }
    }).render(paypalRef.current);
  }, [selectedBillingCycle, planName, planPrice, user, onSuccess, onClose]);

  // Render PayPal button when ready
  useEffect(() => {
    if (paypalLoaded && agreedToTerms && paypalRef.current && window.paypal) {
      console.log('[PayPal] Rendering button');
      renderPayPalButton();
    }
  }, [paypalLoaded, agreedToTerms, renderPayPalButton]);


  if (!isOpen) return null;

  // Pricing Display Logic
  const monthlyPrice = planPrice;
  const quarterlyTotal = planPrice * 3;
  const annualTotal = planPrice * 10; // 2 months free
  
  let displayPrice = `$${monthlyPrice}/mo`;
  let billedAmount = `$${monthlyPrice.toFixed(2)} billed monthly`;
  let renewalPeriod = 'month';

  if (selectedBillingCycle === 'quarterly') {
    displayPrice = `$${(quarterlyTotal / 3).toFixed(2)}/mo`; // Still $8/mo effectively
    billedAmount = `$${quarterlyTotal.toFixed(2)} billed quarterly`;
    renewalPeriod = '3 months';
  } else if (selectedBillingCycle === 'annual') {
    displayPrice = `$${(annualTotal / 12).toFixed(2)}/mo`;
    billedAmount = `$${annualTotal.toFixed(2)} billed yearly`;
    renewalPeriod = '12 months';
  }

  const backdropClass = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm';
  
  const modalClass = `relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
    theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-white'
  }`;

  return (
    <div className={backdropClass} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={modalClass}>
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 z-10 bg-[#F2E8CF] flex flex-col items-center justify-center text-[#2D2D2D] animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 animate-pop-up">
              <Check className="w-8 h-8 text-[#F2E8CF]" />
            </div>
            <h3 className="text-3xl font-heading font-bold tracking-tight mt-2">Payment Successful!</h3>
            <p className="text-base font-medium opacity-80 mt-1">Welcome to Premium</p>
          </div>
        )}

        {/* Header */}
        <div className={`p-6 border-b ${theme === 'dark' ? 'border-[#333]' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2E8CF] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[#2D2D2D]" />
              </div>
              <div>
                <h2 className={`text-2xl font-heading font-bold tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#2D2D2D]'}`}>
                  {planName}
                </h2>
                <div className="flex items-center gap-2">
                   <p className={`text-sm font-medium tracking-wide ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {displayPrice}
                  </p>
                  {selectedBillingCycle === 'annual' && (
                    <span className="text-[10px] uppercase tracking-wider bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">
                      Save 16%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                theme === 'dark' ? 'hover:bg-[#333] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className={`flex p-1 rounded-lg ${theme === 'dark' ? 'bg-[#252525]' : 'bg-gray-100'}`}>
            <button
              onClick={() => setSelectedBillingCycle('monthly')}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                selectedBillingCycle === 'monthly'
                  ? 'bg-[#F2E8CF] text-[#2D2D2D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setSelectedBillingCycle('quarterly')}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                selectedBillingCycle === 'quarterly'
                  ? 'bg-[#F2E8CF] text-[#2D2D2D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setSelectedBillingCycle('annual')}
              className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-all ${
                selectedBillingCycle === 'annual'
                  ? 'bg-[#F2E8CF] text-[#2D2D2D] shadow-sm'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Payment Method Tabs */}
        <div className={`border-b ${theme === 'dark' ? 'border-[#333]' : 'border-gray-100'}`}>
          <div className="flex">
            <button
              onClick={() => setPaymentMethod('gcash')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'gcash'
                  ? 'text-[#007DFE] border-b-2 border-[#007DFE]'
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} border-b-2 border-transparent`
              }`}
            >
              <Wallet className="w-4 h-4" />
              GCash / Maya
            </button>
            <button
              onClick={() => setPaymentMethod('paypal')}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                paymentMethod === 'paypal'
                  ? 'text-[#0070ba] border-b-2 border-[#0070ba]'
                  : `${theme === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} border-b-2 border-transparent`
              }`}
            >
              <CreditCard className="w-4 h-4" />
              PayPal
            </button>
          </div>
        </div>

        {/* Payment Content */}
        <div className="p-6">
          <div className="space-y-4">
            {!agreedToTerms ? (
              <div className={`py-8 rounded-xl border-2 border-dashed text-center ${
                theme === 'dark' ? 'border-[#444] text-gray-500' : 'border-gray-200 text-gray-400'
              }`}>
                <p className="text-sm">Please agree to the terms below to continue</p>
              </div>
            ) : paymentMethod === 'gcash' ? (
              /* GCash Button */
              <button
                onClick={handleGcashPayment}
                disabled={isProcessingGcash}
                className="w-full py-4 px-6 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-3 bg-[#007DFE] hover:bg-[#0066CC] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingGcash ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    Pay with GCash / Maya
                  </>
                )}
              </button>
            ) : (
              /* PayPal Button */
              <div ref={paypalRef} className="min-h-[150px]">
                {!paypalLoaded && (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-[#0070ba] border-t-transparent rounded-full animate-spin" />
                    <span className="ml-2 text-sm text-gray-500">Loading PayPal...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Terms */}
        <div className={`px-6 pb-6 space-y-4`}>
          {/* Terms Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 transition-all ${
                agreedToTerms 
                  ? 'bg-[#F2E8CF] border-[#F2E8CF]' 
                  : theme === 'dark' ? 'border-[#444] group-hover:border-[#666]' : 'border-gray-300 group-hover:border-gray-400'
              }`}>
                {agreedToTerms && <Check className="w-4 h-4 text-[#2D2D2D]" />}
              </div>
            </div>
            <span className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              I agree to the{' '}
              <a href="#" className="text-[#F2E8CF] hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-[#F2E8CF] hover:underline">Privacy Policy</a>
            </span>
          </label>

          {/* Subscription Info */}
          <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            Your subscription will automatically renew every {renewalPeriod}. 
            You will be charged {billedAmount} on each renewal until you cancel your subscription. 
            If you cancel, previous charges will not be refunded, but you may continue to use the service 
            until the end of the term you paid for.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;

import React, { useState, useRef } from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
  theme: 'light' | 'dark';
  onSubmit: (formData: PaymentFormData) => void;
  isProcessing: boolean;
  planPrice: string;
  planName: string;
}

export interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  postalCode: string;
}

// Card brand detection based on number prefix
const getCardBrand = (number: string): string | null => {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';
  if (/^6(?:011|5)/.test(cleaned)) return 'discover';
  return null;
};

// Format card number with spaces
const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : '';
};

// Format expiry as MM/YY
const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '').slice(0, 4);
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
};

const PaymentForm: React.FC<PaymentFormProps> = ({
  theme,
  onSubmit,
  isProcessing,
  planPrice,
  planName
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const expiryRef = useRef<HTMLInputElement>(null);
  const cvvRef = useRef<HTMLInputElement>(null);
  const postalRef = useRef<HTMLInputElement>(null);

  const cardBrand = getCardBrand(cardNumber);

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    
    const cleanedCard = cardNumber.replace(/\s/g, '');
    if (cleanedCard.length < 15) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    
    const [month, year] = expiryDate.split('/');
    const monthNum = parseInt(month, 10);
    if (!month || !year || monthNum < 1 || monthNum > 12 || year.length !== 2) {
      newErrors.expiryDate = 'Invalid expiry date';
    }
    
    if (cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }
    
    if (postalCode.length < 3) {
      newErrors.postalCode = 'Invalid postal code';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ cardNumber, expiryDate, cvv, postalCode });
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    // Auto-advance to expiry when card number is complete
    if (formatted.replace(/\s/g, '').length === 16) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiryDate(formatted);
    // Auto-advance to CVV when expiry is complete
    if (formatted.length === 5) {
      cvvRef.current?.focus();
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(value);
    // Auto-advance to postal when CVV is complete
    if (value.length >= 3) {
      postalRef.current?.focus();
    }
  };

  const isFormValid = cardNumber.replace(/\s/g, '').length >= 15 && 
                      expiryDate.length === 5 && 
                      cvv.length >= 3 && 
                      postalCode.length >= 3;

  const inputBaseClass = `w-full px-4 py-3 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D2B48C]/50 ${
    theme === 'dark'
      ? 'bg-[#2a2a2a] border-[#444] text-white placeholder-gray-500'
      : 'bg-white border-gray-200 text-[#2D2D2D] placeholder-gray-400'
  }`;

  const labelClass = `block text-xs font-medium mb-2 ${
    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  }`;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Card Number */}
      <div>
        <label className={labelClass}>Card number</label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            placeholder="1234 5678 9012 3456"
            className={`${inputBaseClass} pr-12 ${errors.cardNumber ? 'border-red-400 focus:ring-red-400/50' : ''}`}
            autoComplete="cc-number"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {cardBrand ? (
              <span className="text-xs font-bold uppercase text-[#D2B48C]">{cardBrand}</span>
            ) : (
              <CreditCard className={`w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            )}
          </div>
        </div>
        {errors.cardNumber && (
          <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Expiry, CVV, Postal Code Row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>MM/YY</label>
          <input
            ref={expiryRef}
            type="text"
            value={expiryDate}
            onChange={handleExpiryChange}
            placeholder="MM/YY"
            className={`${inputBaseClass} ${errors.expiryDate ? 'border-red-400' : ''}`}
            autoComplete="cc-exp"
          />
        </div>
        <div>
          <label className={labelClass}>CVV</label>
          <input
            ref={cvvRef}
            type="text"
            value={cvv}
            onChange={handleCvvChange}
            placeholder="123"
            className={`${inputBaseClass} ${errors.cvv ? 'border-red-400' : ''}`}
            autoComplete="cc-csc"
          />
        </div>
        <div>
          <label className={labelClass}>Postal code</label>
          <input
            ref={postalRef}
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.slice(0, 10))}
            placeholder="12345"
            className={`${inputBaseClass} ${errors.postalCode ? 'border-red-400' : ''}`}
            autoComplete="postal-code"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || isProcessing}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
          isFormValid && !isProcessing
            ? 'bg-[#D2B48C] text-[#2D2D2D] hover:bg-[#C1A278] hover:shadow-lg hover:shadow-[#D2B48C]/30 cursor-pointer'
            : `cursor-not-allowed ${theme === 'dark' ? 'bg-[#333] text-gray-500' : 'bg-gray-100 text-gray-400'}`
        }`}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Pay {planPrice}
          </>
        )}
      </button>

      {/* Security Note */}
      <p className={`text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <Lock className="w-3 h-3 inline mr-1" />
        Your payment is secured with 256-bit SSL encryption
      </p>
    </form>
  );
};

export default PaymentForm;

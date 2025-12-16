/**
 * PayMongo Service
 * 
 * Handles GCash/Maya/GrabPay payments via PayMongo gateway.
 * Uses Supabase Edge Functions for secure API calls.
 */

import { supabase } from '../lib/supabase';

export interface PaymentLinkResponse {
  checkoutUrl: string;
  linkId: string;
}

export interface PaymentLinkRequest {
  userId: string;
  plan: 'premium';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  amount: number; // in centavos (e.g., 800 = ₱8.00)
  description: string;
}

/**
 * Create a PayMongo payment link via Supabase Edge Function
 */
export async function createPaymentLink(
  request: PaymentLinkRequest
): Promise<PaymentLinkResponse> {
  console.log('[PayMongo] Creating payment link:', request);

  // Get current session to pass auth token
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error('User not authenticated');
  }

  console.log('[PayMongo] Calling Edge Function via fetch...');

  // Direct fetch to Edge Function (more reliable than supabase.functions.invoke)
  const response = await fetch(
    'https://entspntcekcvomxlrdba.supabase.co/functions/v1/create-payment-link',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(request),
    }
  );

  console.log('[PayMongo] Response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[PayMongo] Edge function error:', errorText);
    throw new Error(`Failed to create payment link: ${errorText}`);
  }

  const data = await response.json();

  if (!data?.checkoutUrl) {
    console.error('[PayMongo] Invalid response:', data);
    throw new Error('Invalid payment link response');
  }

  console.log('[PayMongo] Payment link created:', data.checkoutUrl);
  return data as PaymentLinkResponse;
}

/**
 * Calculate amount in centavos based on billing cycle
 * PayMongo requires minimum ₱100.00 (10000 centavos)
 * 
 * Pricing (PHP - based on $12 USD ≈ ₱700):
 * - Monthly: ₱700 = 70000 centavos
 * - Quarterly: ₱2100 = 210000 centavos (3 months)
 * - Annual: ₱7000 = 700000 centavos (10 months, 2 free)
 */
export function calculateAmountCentavos(
  _basePrice: number, // Not used, we use fixed PHP prices
  billingCycle: 'monthly' | 'quarterly' | 'annual'
): number {
  switch (billingCycle) {
    case 'monthly':
      return 70000; // ₱700
    case 'quarterly':
      return 210000; // ₱2,100 (3 months)
    case 'annual':
      return 700000; // ₱7,000 (10 months, 2 free)
    default:
      return 70000;
  }
}

/**
 * Get plan description for PayMongo checkout
 */
export function getPlanDescription(
  billingCycle: 'monthly' | 'quarterly' | 'annual'
): string {
  switch (billingCycle) {
    case 'monthly':
      return 'Academic Integrity Agent - Premium (Monthly)';
    case 'quarterly':
      return 'Academic Integrity Agent - Premium (Quarterly)';
    case 'annual':
      return 'Academic Integrity Agent - Premium (Annual)';
    default:
      return 'Academic Integrity Agent - Premium';
  }
}

// Supabase Edge Function: Verify PayPal Order
// 
// Verifies a PayPal order status server-side before granting premium access.
// Prevents clients from spoofing payment success.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
    const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
    const PAYPAL_API_BASE = Deno.env.get('PAYPAL_MODE') === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
      throw new Error('PayPal credentials not configured');
    }

    // 1. Authenticate Request from Frontend
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401, headers: corsHeaders });
    }

    const { orderId, billingCycle } = await req.json();
    if (!orderId || !billingCycle) {
      return new Response(JSON.stringify({ error: 'Missing orderId or billingCycle' }), { status: 400, headers: corsHeaders });
    }

    console.log(`[PayPal] Verifying order ${orderId} for user ${user.id}`);

    // 2. Get PayPal Access Token
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const tokenParams = new URLSearchParams();
    tokenParams.append('grant_type', 'client_credentials');

    const tokenRes = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenRes.ok) {
      const error = await tokenRes.text();
      console.error('[PayPal] Failed to get access token:', error);
      throw new Error('Failed to connect to PayPal');
    }

    const { access_token } = await tokenRes.json();

    // 3. Verify Order Status
    const orderRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!orderRes.ok) {
      throw new Error('Failed to fetch order details');
    }

    const orderData = await orderRes.json();
    
    // Verify status is COMPLETED or APPROVED (if we needed to capture, but client captured)
    // The client typically captures, so status should be 'COMPLETED'.
    if (orderData.status !== 'COMPLETED') {
      console.error(`[PayPal] Invalid order status: ${orderData.status}`);
      return new Response(JSON.stringify({ error: `Order status is ${orderData.status}, expected COMPLETED` }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 4. Update Subscription
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

     // Calculate subscription dates
     const now = new Date();
     let endDate = new Date(now);
     
     switch (billingCycle) {
       case 'monthly':
         endDate.setMonth(endDate.getMonth() + 1);
         break;
       case 'quarterly':
         endDate.setMonth(endDate.getMonth() + 3);
         break;
       case 'annual':
         endDate.setFullYear(endDate.getFullYear() + 1);
         break;
     }

    const { error: upsertError } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan: 'premium',
        billing_cycle: billingCycle,
        status: 'active',
        start_date: now.toISOString(),
        end_date: endDate.toISOString(),
        payment_method: 'paypal',
        paypal_subscription_id: orderId, // storing orderID as subscription ID for reference
        updated_at: now.toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (upsertError) {
      console.error('[PayPal] Database update failed:', upsertError);
      throw new Error('Failed to update subscription');
    }

    return new Response(JSON.stringify({ success: true, message: 'Subscription updated' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PayPal] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

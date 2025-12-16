// Supabase Edge Function: Create PayMongo Payment Link
// 
// This function securely creates a PayMongo payment link for GCash/Maya payments.
// It's invoked from the frontend via supabase.functions.invoke()

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentLinkRequest {
  userId: string;
  plan: 'premium';
  billingCycle: 'monthly' | 'quarterly' | 'annual';
  amount: number; // in centavos
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAYMONGO_SECRET_KEY = Deno.env.get('PAYMONGO_SECRET_KEY');
    if (!PAYMONGO_SECRET_KEY) {
      throw new Error('PAYMONGO_SECRET_KEY not configured');
    }

    // Get Supabase client for auth verification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body: PaymentLinkRequest = await req.json();
    const { userId, plan, billingCycle, amount, description } = body;

    // Validate user ID matches authenticated user
    if (userId !== user.id) {
      return new Response(JSON.stringify({ error: 'User ID mismatch' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[PayMongo] Creating payment link for:', { userId, plan, billingCycle, amount });

    // Simple base64 encoding for HTTP Basic Auth
    const authString = btoa(`${PAYMONGO_SECRET_KEY}:`);
    
    console.log('[PayMongo] Calling PayMongo API...');

    // Create PayMongo payment link with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const paymongoResponse = await fetch('https://api.paymongo.com/v1/links', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amount,
              description: description,
              remarks: JSON.stringify({ userId, plan, billingCycle }),
            },
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await paymongoResponse.text();
      console.log('[PayMongo] Response status:', paymongoResponse.status);
      console.log('[PayMongo] Response body:', responseText);

      if (!paymongoResponse.ok) {
        console.error('[PayMongo] API error:', responseText);
        throw new Error(`PayMongo API error: ${responseText}`);
      }


      const paymongoData = JSON.parse(responseText);
      const checkoutUrl = paymongoData.data.attributes.checkout_url;
      const linkId = paymongoData.data.id;

      console.log('[PayMongo] Payment link created:', { linkId, checkoutUrl });

      return new Response(
        JSON.stringify({ checkoutUrl, linkId }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error('[PayMongo] Request timed out after 30s');
        throw new Error('PayMongo API timeout');
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('[PayMongo] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Supabase Edge Function: PayMongo Webhook Handler
//
// Handles payment confirmation webhooks from PayMongo.
// Updates subscription in Supabase when payment is successful.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, paymongo-signature',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const PAYMONGO_WEBHOOK_SECRET = Deno.env.get('PAYMONGO_WEBHOOK_SECRET');
    
    // In production, verify webhook signature
    // const signature = req.headers.get('paymongo-signature');
    // TODO: Implement signature verification for production

    const body = await req.json();
    console.log('[Webhook] Received event:', body.data?.attributes?.type);

    const eventType = body.data?.attributes?.type;
    const resource = body.data?.attributes?.data;

    // Handle payment success
    if (eventType === 'link.payment.paid') {
      const linkData = resource?.attributes;
      const remarks = linkData?.remarks;

      if (!remarks) {
        console.error('[Webhook] No remarks found in payment');
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Parse metadata from remarks
      let metadata;
      try {
        metadata = JSON.parse(remarks);
      } catch {
        console.error('[Webhook] Failed to parse remarks:', remarks);
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { userId, plan, billingCycle } = metadata;
      console.log('[Webhook] Processing payment for:', { userId, plan, billingCycle });

      // Create Supabase client with service role for admin access
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

      // Upsert subscription
      const { error: upsertError } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: userId,
          plan: 'premium',
          billing_cycle: billingCycle,
          status: 'active',
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          payment_method: 'gcash',
          paymongo_link_id: resource?.id,
          updated_at: now.toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (upsertError) {
        console.error('[Webhook] Failed to update subscription:', upsertError);
        // Return 200 anyway to prevent PayMongo retries
      } else {
        console.log('[Webhook] Subscription updated successfully for user:', userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Webhook] Error:', error);
    // Return 200 to prevent PayMongo retries
    return new Response(JSON.stringify({ received: true, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

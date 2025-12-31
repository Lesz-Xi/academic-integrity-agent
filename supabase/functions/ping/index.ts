import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-ping-key',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('[Ping] Received warm-up request');
  const startTime = Date.now();

  try {
    // Create Supabase client with service role for DB access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Exercise DB connection with minimal query
    console.log('[Ping] Executing warm-up query...');
    const { data, error } = await supabase
      .from('drafts')
      .select('id')
      .limit(1);

    if (error) {
      console.error('[Ping] DB query error:', error);
    }

    const duration = Date.now() - startTime;
    console.log(`[Ping] Warm-up complete in ${duration}ms`);

    return new Response(
      JSON.stringify({
        status: 'warm',
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        db_connected: !error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (err) {
    console.error('[Ping] Error:', err);
    return new Response(
      JSON.stringify({ 
        status: 'error', 
        message: err.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});

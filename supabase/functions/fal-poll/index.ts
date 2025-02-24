
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Retrieve FAL_KEY from the environment
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set');
    }

    // Parse the request body
    const { requestId } = await req.json();
    if (!requestId) {
      throw new Error('requestId is required');
    }

    // Check status from fal.ai
    const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to check status from fal.ai');
    }

    // Return the status and result if available
    return new Response(
      JSON.stringify({
        status: data.status,
        result: data.result,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

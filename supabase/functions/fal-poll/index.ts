
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
    // Check if request is authenticated
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Retrieve FAL_KEY from the environment
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      console.error('FAL_KEY environment variable is not set');
      throw new Error('Server configuration error');
    }

    // Parse the request body
    const { requestId } = await req.json();
    if (!requestId) {
      throw new Error('requestId is required');
    }

    console.log('Checking status for request:', requestId);

    // Check status from fal.ai
    const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${falKey}`,
      },
    });

    const responseText = await response.text();
    console.log('Fal.ai status response:', responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || 'Failed to check status from fal.ai';
      } catch {
        errorMessage = 'Failed to check status from fal.ai: ' + responseText;
      }
      throw new Error(errorMessage);
    }

    const data = JSON.parse(responseText);
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { 
        status: error.message === 'Missing authorization header' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

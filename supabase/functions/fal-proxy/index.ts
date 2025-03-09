
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

    // Log the received request
    console.log('Received headers:', Object.fromEntries(req.headers.entries()));

    // Retrieve FAL_KEY from the environment
    const falKey = Deno.env.get('FAL_KEY');
    if (!falKey) {
      console.error('FAL_KEY environment variable is not set');
      throw new Error('Server configuration error: FAL_KEY not set');
    }

    // Parse and validate the request body
    let endpoint, input, mode;
    try {
      const body = await req.json();
      endpoint = body.endpoint;
      input = body.input;
      mode = body.mode || 'queue'; // Default to queue mode if not specified
      
      if (!endpoint) throw new Error('endpoint is required');
      if (!input) throw new Error('input is required');
      
      console.log('Request body:', { endpoint, input, mode });
    } catch (e) {
      console.error('Failed to parse request:', e);
      throw new Error('Invalid request body');
    }

    // Submit request to fal.ai
    console.log(`Sending request to fal.ai endpoint: ${endpoint}`);
    const response = await fetch(`https://fal.run/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...input,
        mode,
      }),
    });

    const responseText = await response.text();
    console.log('Fal.ai response:', responseText);

    if (!response.ok) {
      let errorMessage;
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || `Failed to submit request to fal.ai (${response.status})`;
      } catch {
        errorMessage = `Failed to submit request to fal.ai (${response.status}): ${responseText}`;
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse fal.ai response:', e);
      throw new Error('Invalid response from fal.ai');
    }
    
    console.log('Sending response:', {
      requestId: data.request_id,
      status: data.status,
      result: data.result
    });

    return new Response(
      JSON.stringify({
        requestId: data.request_id,
        status: data.status,
        result: data.result,
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal Server Error',
        timestamp: new Date().toISOString(),
      }),
      { 
        status: error.message === 'Missing authorization header' ? 401 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

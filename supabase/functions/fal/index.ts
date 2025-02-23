
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
}

// Base URL for fal.ai API
const FAL_BASE_URL = 'https://rest.fal.ai/api/v1'

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    // Get the path from the URL (everything after /fal/)
    const url = new URL(req.url)
    const path = url.pathname.replace('/fal', '')
    
    // Forward the request to fal.ai
    const response = await fetch(`${FAL_BASE_URL}${path}`, {
      method: req.method,
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? await req.text() : undefined,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to proxy request to fal.ai')
    }

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: response.status,
    })

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal Server Error',
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})

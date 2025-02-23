
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base URL for fal.ai API
const FAL_BASE_URL = 'https://fal.run/v1'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const falKey = Deno.env.get('FAL_KEY')
    if (!falKey) {
      throw new Error('FAL_KEY environment variable is not set')
    }

    const { modelId, input } = await req.json()
    if (!modelId) {
      throw new Error('modelId is required')
    }

    // Make request to fal.ai
    const response = await fetch(`${FAL_BASE_URL}/${modelId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
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

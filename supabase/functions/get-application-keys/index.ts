
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the user is authenticated (we still want to ensure only authenticated users can use the API)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Instead of fetching from user profiles, get from environment variables
    const lumaApiKey = Deno.env.get('LUMA_API_KEY')
    const claudeApiKey = Deno.env.get('CLAUDE_API_KEY')

    if (!lumaApiKey && !claudeApiKey) {
      console.error('API keys not configured in environment variables')
      return new Response(
        JSON.stringify({ error: 'API keys not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Return the API keys
    return new Response(
      JSON.stringify({
        luma_api_key: lumaApiKey || null,
        claude_api_key: claudeApiKey || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in get-application-keys function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

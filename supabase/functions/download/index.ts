
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      throw new Error('Method not allowed')
    }

    // Parse URL and get the target URL from query parameters
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      throw new Error('Missing URL parameter');
    }

    // Validate URL
    try {
      new URL(targetUrl);
    } catch (e) {
      throw new Error('Invalid URL provided');
    }

    // Fetch the file from the target URL
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
    }

    // Get content type
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentLength = response.headers.get('content-length');
    
    // Get the file data
    const fileData = await response.arrayBuffer();

    // Prepare response headers
    const headers = {
      ...corsHeaders,
      'Content-Type': contentType,
    };
    
    if (contentLength) {
      headers['Content-Length'] = contentLength;
    }
    
    // Return the file data with appropriate headers
    return new Response(fileData, { 
      headers,
      status: 200 
    });

  } catch (error) {
    console.error('Download error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

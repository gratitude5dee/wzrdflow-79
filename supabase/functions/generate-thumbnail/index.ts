
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ThumbnailRequestBody {
  videoUrl: string;
  mediaItemId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed');
    }

    // Get the JWT from the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid token');
    }

    // Parse and validate the request body
    const { videoUrl, mediaItemId }: ThumbnailRequestBody = await req.json();
    
    if (!videoUrl || !mediaItemId) {
      throw new Error('Missing required fields');
    }

    // In a real implementation, we would generate a thumbnail from the video here
    // For now, we'll just return a mock thumbnail URL
    const thumbnailUrl = `${videoUrl.split('.')[0]}_thumbnail.jpg`;

    // Update the media item with the thumbnail URL
    const { error: updateError } = await supabaseClient
      .from('media_items')
      .update({
        metadata: { thumbnailUrl }
      })
      .eq('id', mediaItemId);

    if (updateError) {
      console.error('Error updating media item:', updateError);
      throw new Error('Failed to update media item with thumbnail');
    }

    // Return the thumbnail URL
    return new Response(
      JSON.stringify({ thumbnailUrl }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Generate thumbnail error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Invalid token' ? 401 : 400,
      }
    );
  }
});

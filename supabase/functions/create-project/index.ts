
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@11.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateProjectBody {
  title: string;
  description?: string;
  aspectRatio?: string;
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
    const { title, description, aspectRatio }: CreateProjectBody = await req.json();
    
    if (!title) {
      throw new Error('Missing required fields');
    }

    // Create project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        description,
        aspect_ratio: aspectRatio || '16:9',
      })
      .select()
      .single();

    if (projectError) {
      console.error('Error creating project:', projectError);
      throw new Error('Failed to create project');
    }

    // Ensure media storage bucket exists
    const { data: buckets } = await supabaseClient
      .storage
      .listBuckets();

    const mediaBucketExists = buckets?.some(bucket => bucket.name === 'media');

    if (!mediaBucketExists) {
      const { error: bucketError } = await supabaseClient
        .storage
        .createBucket('media', {
          public: true,
          fileSizeLimit: 1024 * 1024 * 100, // 100MB
        });

      if (bucketError) {
        console.error('Error creating media bucket:', bucketError);
        // Don't throw, we'll continue even if bucket creation fails
      }
    }

    // Return the project
    return new Response(
      JSON.stringify({ project }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Create project error:', error);
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


import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { nanoid } from 'https://esm.sh/nanoid@5.0.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ShareWorkflowBody {
  workflowId: string;
  title: string;
  description?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get the JWT from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client with service role key
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Parse and validate the request body
    const { workflowId, title, description }: ShareWorkflowBody = await req.json()
    
    if (!workflowId || !title) {
      throw new Error('Missing required fields')
    }

    // Generate a unique share ID
    const shareId = nanoid(10)

    // Insert the shared workflow record
    const { data, error } = await supabaseClient
      .from('shared_workflows')
      .insert({
        workflow_id: workflowId,
        title,
        description,
        created_by: user.id,
        share_id: shareId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating shared workflow:', error)
      throw new Error('Failed to create shared workflow')
    }

    // Return the share ID
    return new Response(
      JSON.stringify({ shareId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Share workflow error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Invalid token' ? 401 : 400,
      }
    )
  }
})

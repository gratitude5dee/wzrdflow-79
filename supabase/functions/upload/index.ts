
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the JWT from the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the JWT and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid token')
    }

    // Parse the multipart form data
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      throw new Error('No file uploaded')
    }

    // Sanitize the filename to prevent issues with special characters
    const fileExt = file.name.split('.').pop()
    const sanitizedFileName = file.name
      .toLowerCase()
      .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
      .replace(/[^a-z0-9.-]/g, '-') // Replace invalid characters with hyphens

    // Generate a unique filename
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '')
    const uniqueFileName = `${timestamp}-${sanitizedFileName}`

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('workflow-media')
      .upload(uniqueFileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Failed to upload file')
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('workflow-media')
      .getPublicUrl(uniqueFileName)

    return new Response(
      JSON.stringify({ 
        url: publicUrl,
        fileName: uniqueFileName,
        contentType: file.type,
        size: file.size
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Upload error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: error.message === 'Invalid token' ? 401 : 400
      }
    )
  }
})

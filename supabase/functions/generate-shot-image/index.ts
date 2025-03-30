
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  shot_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Get the shot ID from the request
    const { shot_id }: RequestBody = await req.json();
    if (!shot_id) {
      return new Response(
        JSON.stringify({ error: 'shot_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating image for shot ID: ${shot_id}`);

    // Fetch shot data to get the visual prompt
    const { data: shotData, error: fetchError } = await supabaseClient
      .from('shots')
      .select('visual_prompt, prompt_idea')
      .eq('id', shot_id)
      .single();

    if (fetchError || !shotData) {
      console.error('Error fetching shot data:', fetchError?.message);
      return new Response(
        JSON.stringify({ error: 'Shot not found or failed to fetch data' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if we have a visual prompt to use
    const visualPrompt = shotData.visual_prompt || shotData.prompt_idea || '';
    if (!visualPrompt) {
      return new Response(
        JSON.stringify({ error: 'No visual prompt available for image generation' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update shot status to generating
    const { error: updateStatusError } = await supabaseClient
      .from('shots')
      .update({ image_status: 'generating' })
      .eq('id', shot_id);

    if (updateStatusError) {
      console.error('Error updating shot status:', updateStatusError);
      // Continue anyway to try generating the image
    }

    console.log(`Shot ${shot_id} status updated to 'generating'. Visual prompt: ${visualPrompt}`);

    // For now, we'll just simulate image generation with a placeholder
    // In a real implementation, you would call Luma API or another image generation service here
    
    // Use a placeholder image URL for testing - in production, replace with actual API call
    const placeholderImageUrl = `https://source.unsplash.com/random/800x600/?${encodeURIComponent(visualPrompt)}`;
    
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Update shot with the generated image
    const { error: updateImageError } = await supabaseClient
      .from('shots')
      .update({
        image_url: placeholderImageUrl,
        image_status: 'completed'
      })
      .eq('id', shot_id);

    if (updateImageError) {
      console.error(`Error updating shot with image URL:`, updateImageError);
      return new Response(
        JSON.stringify({ error: 'Failed to save generated image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully generated image for shot ${shot_id}: ${placeholderImageUrl}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        shot_id: shot_id, 
        image_url: placeholderImageUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error in generate-shot-image:`, error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate image' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

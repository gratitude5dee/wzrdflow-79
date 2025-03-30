
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { initiateLumaImageGeneration, pollLumaResult } from '../_shared/luma.ts';

interface RequestBody {
  shot_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  let shotId: string | null = null; // Track for error reporting

  try {
    // Get the shot ID from the request
    const { shot_id }: RequestBody = await req.json();
    shotId = shot_id;
    
    if (!shotId) {
      return errorResponse('shot_id is required', 400);
    }

    console.log(`[Shot ${shotId}] Starting image generation process.`);

    // 1. Fetch shot data to get the visual prompt
    const { data: shotData, error: fetchError } = await supabaseClient
      .from('shots')
      .select(`
        visual_prompt, 
        prompt_idea,
        project_id,
        scene:scenes (
          project:projects (
            user_id,
            aspect_ratio
          )
        )
      `)
      .eq('id', shotId)
      .single();

    if (fetchError || !shotData) {
      console.error(`[Shot ${shotId}] Error fetching shot data:`, fetchError?.message);
      return errorResponse('Shot not found or failed to fetch data', 404);
    }

    // Extract data from the nested query result
    const visualPrompt = shotData.visual_prompt || shotData.prompt_idea || '';
    const aspectRatio = shotData.scene?.project?.aspect_ratio || '16:9';
    const userId = shotData.scene?.project?.user_id;
    
    if (!visualPrompt) {
      return errorResponse('No visual prompt available for image generation', 400);
    }

    // 2. Update shot status to generating
    const { error: updateStatusError } = await supabaseClient
      .from('shots')
      .update({ 
        image_status: 'generating',
        failure_reason: null 
      })
      .eq('id', shotId);

    if (updateStatusError) {
      console.error(`[Shot ${shotId}] Error updating status:`, updateStatusError);
      // Continue anyway to try generating the image
    } else {
      console.log(`[Shot ${shotId}] Status updated to 'generating'. Visual prompt: ${visualPrompt.substring(0, 100)}...`);
    }

    // 3. Call Luma API
    const lumaApiKey = Deno.env.get('LUMA_API_KEY');
    if (!lumaApiKey) {
      console.error(`[Shot ${shotId}] LUMA_API_KEY environment variable not set.`);
      await updateShotStatus(supabaseClient, shotId, 'failed', 'Server configuration error: Missing Luma API key');
      return errorResponse('Server configuration error: Luma API key not found', 500);
    }

    // Initiate Luma generation
    const lumaResponse = await initiateLumaImageGeneration(lumaApiKey, visualPrompt, aspectRatio, userId);
    
    // Store the Luma generation ID
    await supabaseClient
      .from('shots')
      .update({ luma_generation_id: lumaResponse.id })
      .eq('id', shotId);
    
    console.log(`[Shot ${shotId}] Luma generation initiated. ID: ${lumaResponse.id}`);

    // Poll for completion
    const completedResponse = await pollLumaResult(lumaApiKey, lumaResponse.id);
    const imageUrl = completedResponse.assets.image;
    
    if (!imageUrl) {
      await updateShotStatus(supabaseClient, shotId, 'failed', 'Luma returned a completed status but no image URL');
      return errorResponse('Luma returned no image URL', 500);
    }

    // 4. Update shot with the final image URL
    const { error: updateImageError } = await supabaseClient
      .from('shots')
      .update({
        image_url: imageUrl,
        image_status: 'completed'
      })
      .eq('id', shotId);

    if (updateImageError) {
      console.error(`[Shot ${shotId}] Error updating with image URL:`, updateImageError);
      return errorResponse('Failed to save generated image', 500);
    }

    console.log(`[Shot ${shotId}] Successfully generated image: ${imageUrl}`);

    return successResponse({ 
      success: true, 
      shot_id: shotId, 
      image_url: imageUrl
    });
    
  } catch (error) {
    console.error(`[Shot ${shotId || 'UNKNOWN'}] Error in generate-shot-image:`, error);
    
    // Update shot status if we have the ID
    if (shotId) {
      await updateShotStatus(
        supabaseClient, 
        shotId, 
        'failed', 
        error.message?.substring(0, 250) || 'Unknown error during generation'
      );
    }
    
    return errorResponse(error.message || 'Failed to generate image', 500);
  }
});

// Helper function to update shot status on error
async function updateShotStatus(
  supabaseClient: any, 
  shotId: string, 
  status: string, 
  failureReason?: string
) {
  try {
    const update: any = { image_status: status };
    if (failureReason) {
      update.failure_reason = failureReason;
    }
    
    await supabaseClient
      .from('shots')
      .update(update)
      .eq('id', shotId);
      
    console.log(`[Shot ${shotId}] Status updated to '${status}'${failureReason ? ` with reason: ${failureReason}` : ''}`);
  } catch (error) {
    console.error(`[Shot ${shotId}] Failed to update status:`, error);
  }
}

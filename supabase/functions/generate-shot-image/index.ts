
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { initiateLumaImageGeneration, pollLumaResult } from '../_shared/luma.ts';

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

    let shotId = ''; // Keep track of shotId for error logging

    try {
        const body: RequestBody = await req.json();
        shotId = body.shot_id; // Assign early for logging
        if (!shotId) {
            return new Response(
                JSON.stringify({ error: 'shot_id is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        console.log(`Generating image for shot ID: ${shotId}`);

        // 1. Fetch Shot Data (including visual_prompt and project aspect ratio)
        const { data: shotData, error: fetchError } = await supabaseClient
            .from('shots')
            .select(`
                visual_prompt,
                project:projects ( aspect_ratio )
            `)
            .eq('id', shotId)
            .single();

        if (fetchError || !shotData) {
            console.error(`Error fetching shot ${shotId}:`, fetchError?.message);
            return new Response(
                JSON.stringify({ error: 'Shot not found or failed to fetch' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const visualPrompt = shotData.visual_prompt;
        const aspectRatio = shotData.project?.aspect_ratio || "16:9"; // Default aspect ratio

        if (!visualPrompt) {
            console.warn(`Shot ${shotId} has no visual_prompt. Cannot generate image.`);
            return new Response(
                JSON.stringify({ error: 'Visual prompt not found for this shot. Generate prompt first.' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Update shot status to 'generating'
        console.log(`Updating shot ${shotId} status to 'generating'...`);
        const { error: updateGeneratingError } = await supabaseClient
            .from('shots')
            .update({ image_status: 'generating', image_url: null, luma_generation_id: null })
            .eq('id', shotId);

        if (updateGeneratingError) {
            console.error(`Failed to update shot ${shotId} status to generating:`, updateGeneratingError);
            return new Response(
                JSON.stringify({ error: 'Failed to initiate image generation (DB update failed)' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 3. Call Luma API to initiate generation
        const lumaApiKey = Deno.env.get('LUMA_API_KEY');
        if (!lumaApiKey) {
            return new Response(
                JSON.stringify({ error: 'Server config error: Luma key missing' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const initialLumaResponse = await initiateLumaImageGeneration(lumaApiKey, visualPrompt, aspectRatio);
        const generationId = initialLumaResponse.id;

        // 4. Store Luma Generation ID
        const { error: updateLumaIdError } = await supabaseClient
            .from('shots')
            .update({ luma_generation_id: generationId })
            .eq('id', shotId);

         if (updateLumaIdError) {
            // Log warning but proceed with polling, the generation is already started
            console.warn(`Failed to store Luma generation ID ${generationId} for shot ${shotId}:`, updateLumaIdError.message);
        }

        // --- Polling Logic Starts Here ---
        // This runs within the edge function - be mindful of execution limits

        try {
            console.log(`Starting polling for Luma job ${generationId} (Shot ID: ${shotId})...`);
            const completedResult = await pollLumaResult(lumaApiKey, generationId);
            const imageUrl = completedResult.assets.image;

            if (!imageUrl) {
                 throw new Error("Luma completed but image URL was missing.");
            }

            console.log(`Luma job ${generationId} completed. Image URL: ${imageUrl}`);

            // 5. Update shot status to 'completed' with the image URL
            const { error: updateCompletedError } = await supabaseClient
                .from('shots')
                .update({ image_status: 'completed', image_url: imageUrl })
                .eq('id', shotId);

            if (updateCompletedError) {
                console.error(`Failed to update shot ${shotId} as completed:`, updateCompletedError);
                return new Response(
                    JSON.stringify({ error: 'Image generated but failed to save URL to database.' }),
                    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            console.log(`Shot ${shotId} successfully updated with completed image.`);
            return new Response(
                JSON.stringify({ success: true, shot_id: shotId, image_url: imageUrl }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

        } catch (pollingError) {
             // Handle polling errors (timeout or explicit failure from Luma)
            console.error(`Polling or final processing failed for Luma job ${generationId} (Shot ID: ${shotId}):`, pollingError.message);

            // Update shot status to 'failed'
            const { error: updateFailedError } = await supabaseClient
                .from('shots')
                .update({ image_status: 'failed' })
                .eq('id', shotId);

            if (updateFailedError) {
                console.error(`Failed to update shot ${shotId} status to failed after polling error:`, updateFailedError);
            }

            // Return an error response indicating the generation failed
            return new Response(
                JSON.stringify({ error: `Image generation failed: ${pollingError.message}` }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

    } catch (error) {
        console.error(`Error in generate-shot-image (Shot ID: ${shotId || 'N/A'}):`, error);

        // Attempt to mark the shot as failed if we know the shotId and an error occurred before 'completed'
        if (shotId) {
             try {
                 await supabaseClient
                    .from('shots')
                    .update({ image_status: 'failed' })
                    .eq('id', shotId)
                    .neq('image_status', 'completed'); // Avoid overwriting if it somehow completed
             } catch (dbError) {
                 console.error(`Failed to mark shot ${shotId} as failed during error handling:`, dbError);
             }
        }

        return new Response(
            JSON.stringify({ error: error.message || 'Failed to generate shot image' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

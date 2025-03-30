
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { callClaudeApi } from '../_shared/claude.ts';

interface LumaGenerationResponse { id: string; state: string; }
interface LumaCompletedResponse extends LumaGenerationResponse { state: 'completed'; assets: { image: string | null; video?: string | null }; }
interface LumaFailedResponse extends LumaGenerationResponse { state: 'failed'; failure_reason: string | null; }

async function callLumaApi(lumaApiKey: string, visualPrompt: string, aspectRatio: string = "16:9", model: string = "photon-flash-1"): Promise<{ generationId: string, imageUrl: string | null }> {
    console.log(`Calling Luma API (${model}) for shot image. Prompt: ${visualPrompt.substring(0, 50)}...`);
    const lumaApiUrl = "https://api.lumalabs.ai/dream-machine/v1/generations/image";
    const payload = { prompt: visualPrompt, aspect_ratio: aspectRatio, model: model };

    const response = await fetch(lumaApiUrl, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${lumaApiKey}`, 'Content-Type': 'application/json', 'accept': 'application/json' },
        body: JSON.stringify(payload)
    });
    const responseBodyText = await response.text();
    if (!response.ok) throw new Error(`Luma API Error (${response.status}): ${responseBodyText}`);
    const initialResponse: LumaGenerationResponse = JSON.parse(responseBodyText);
    if (!initialResponse.id) throw new Error("Luma API did not return a generation ID.");
    console.log(`Luma job submitted. Generation ID: ${initialResponse.id}`);
    const imageUrl = await pollLumaResult(lumaApiKey, initialResponse.id);
    return { generationId: initialResponse.id, imageUrl: imageUrl };
}

async function pollLumaResult(lumaApiKey: string, generationId: string, maxAttempts = 60, delay = 3000): Promise<string | null> {
    console.log(`Polling Luma result (ID: ${generationId})...`);
    const pollUrl = `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Poll attempt ${attempt}/${maxAttempts} for ${generationId}`);
        try {
            await new Promise(resolve => setTimeout(resolve, delay));
            const response = await fetch(pollUrl, { method: 'GET', headers: { 'Authorization': `Bearer ${lumaApiKey}`, 'accept': 'application/json' } });
            const responseBodyText = await response.text();
            if (!response.ok) {
                console.warn(`Luma Poll Warn (${response.status}) for ${generationId}:`, responseBodyText);
                if (response.status === 401 || response.status === 404) throw new Error(`Luma Poll Error (${response.status}): ${responseBodyText}`);
                continue;
            }
            const pollData: LumaGenerationResponse = JSON.parse(responseBodyText);
            console.log(`Luma Poll Status (ID: ${generationId}): ${pollData.state}`);
            if (pollData.state === 'completed') {
                const completedData = pollData as LumaCompletedResponse;
                return completedData.assets?.image || null;
            } else if (pollData.state === 'failed') {
                const failedData = pollData as LumaFailedResponse;
                console.error(`Luma generation failed for ${generationId}:`, failedData);
                throw new Error(`Luma image generation failed: ${failedData.failure_reason || 'Unknown'}`);
            }
        } catch (pollError) {
            console.error(`Error during Luma poll attempt ${attempt} for ${generationId}:`, pollError);
            if (attempt === maxAttempts) throw pollError;
        }
    }
    throw new Error(`Luma polling timed out after ${maxAttempts} attempts for ${generationId}`);
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return handleCors();

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
    );

    let shot_id: string | null = null;

    try {
        const body = await req.json();
        shot_id = body.shot_id;
        if (!shot_id) return errorResponse('shot_id is required', 400);

        console.log(`Generating image for Shot ID: ${shot_id}`);

        // 1. Update Shot Status to 'generating'
        const { error: statusUpdateError } = await supabaseClient
            .from('shots')
            .update({ image_status: 'generating' })
            .eq('id', shot_id);
        if (statusUpdateError) console.warn(`Failed to update shot ${shot_id} status to generating:`, statusUpdateError.message);

        // 2. Fetch Shot and Context
        const { data: shotData, error: fetchError } = await supabaseClient
            .from('shots')
            .select(`
                prompt_idea,
                shot_type,
                scene:scenes ( location, lighting, weather, project:projects ( video_style, genre, tone, cinematic_inspiration, aspect_ratio ) )
            `)
            .eq('id', shot_id)
            .single();

        if (fetchError || !shotData) return errorResponse('Shot not found', 404, fetchError?.message);

        // 3. Refine Visual Prompt using Claude
        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        let finalVisualPrompt = shotData.prompt_idea || "default image";

        if (claudeApiKey && shotData.prompt_idea) {
            try {
                const refineSystemPrompt = `You are an AI assistant refining a conceptual shot idea into a detailed visual prompt suitable for an image generation model like Luma Photon or SDXL.
Input: A 'prompt_idea', shot type, and scene/project context.
Output: A comma-separated list of keywords and descriptive phrases focusing ONLY on visual elements.
Instructions:
- Incorporate details from the scene context (location, lighting, weather) and project style (genre, tone, video_style, inspiration).
- Reflect the specified 'shot_type' (e.g., add 'wide angle', 'close up on face', 'over the shoulder view').
- Enhance the core 'prompt_idea' with specific visual details (colors, textures, composition elements, mood).
- Prioritize visual description. Avoid action verbs unless essential to the static image.
- Keep it concise but visually rich.
- Output *only* the comma-separated prompt string.`;

                let refineUserPrompt = `Refine the following shot idea into a detailed visual prompt:\n
Prompt Idea: ${shotData.prompt_idea}
Shot Type: ${shotData.shot_type || 'Not specified'}
Scene Location: ${shotData.scene?.location || 'N/A'}
Scene Lighting: ${shotData.scene?.lighting || 'N/A'}
Scene Weather: ${shotData.scene?.weather || 'N/A'}
Project Style: ${shotData.scene?.project?.video_style || 'N/A'}
Project Genre/Tone: ${shotData.scene?.project?.genre || 'N/A'} / ${shotData.scene?.project?.tone || 'N/A'}
Project Inspiration: ${shotData.scene?.project?.cinematic_inspiration || 'N/A'}`;

                finalVisualPrompt = await callClaudeApi(claudeApiKey, refineSystemPrompt, refineUserPrompt, 300);
                console.log(`Refined Visual Prompt for shot ${shot_id}: ${finalVisualPrompt}`);

                await supabaseClient.from('shots').update({ visual_prompt: finalVisualPrompt }).eq('id', shot_id);
            } catch(claudeError) {
                console.warn(`Failed to refine prompt for shot ${shot_id}, using original idea:`, claudeError.message);
                finalVisualPrompt = shotData.prompt_idea;
                await supabaseClient.from('shots').update({ visual_prompt: finalVisualPrompt }).eq('id', shot_id);
            }
        } else if (shotData.prompt_idea) {
            finalVisualPrompt = shotData.prompt_idea;
            await supabaseClient.from('shots').update({ visual_prompt: finalVisualPrompt }).eq('id', shot_id);
        }

        // 4. Generate Image using Luma API
        const lumaApiKey = Deno.env.get('LUMA_API_KEY');
        if (!lumaApiKey) return errorResponse('Server config error: Luma key missing', 500);

        const aspectRatio = shotData.scene?.project?.aspect_ratio || "16:9";
        const model = "photon-flash-1";

        const { generationId, imageUrl } = await callLumaApi(lumaApiKey, finalVisualPrompt, aspectRatio, model);

        // 5. Update Shot Record with Image URL and Status
        const updatePayload = {
            image_url: imageUrl,
            image_status: imageUrl ? 'completed' : 'failed',
            luma_generation_id: generationId
        };

        const { error: updateError } = await supabaseClient
            .from('shots')
            .update(updatePayload)
            .eq('id', shot_id);

        if (updateError) {
            console.error(`Failed to update shot ${shot_id} with image URL/status:`, updateError);
            return errorResponse('Image generated but failed to save final status/URL', 500, updateError.message);
        }

        console.log(`Successfully processed image generation for shot ${shot_id}. Status: ${updatePayload.image_status}`);
        return successResponse({ success: true, shot_id: shot_id, image_url: imageUrl });

    } catch (error) {
        console.error(`Error generating image for shot ${shot_id || 'unknown'}:`, error);
        if (shot_id) {
            try {
                await supabaseClient.from('shots').update({ image_status: 'failed' }).eq('id', shot_id);
            } catch (updateFailError) {
                console.error(`Failed to mark shot ${shot_id} as failed after error:`, updateFailError);
            }
        }
        return errorResponse(error.message || 'Failed to generate shot image', 500);
    }
});

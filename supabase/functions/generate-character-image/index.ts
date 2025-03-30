
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { callClaudeApi } from '../_shared/claude.ts';

// --- Interfaces ---
interface RequestBody {
    character_id: string;
    project_id?: string; // Optional: for context in prompts
}

interface CharacterData {
    name: string;
    description: string | null;
    project?: {
        genre?: string | null;
        tone?: string | null;
        video_style?: string | null;
        cinematic_inspiration?: string | null;
    }
}

interface LumaGenerationResponse {
    id: string;
    state: 'pending' | 'processing' | 'completed' | 'failed';
    created_at: string;
}

interface LumaCompletedResponse extends LumaGenerationResponse {
    state: 'completed';
    assets: {
        video: string | null;
        image: string | null;
    };
}

interface LumaFailedResponse extends LumaGenerationResponse {
    state: 'failed';
    failure_reason: string | null;
}

// --- Helper Functions ---
async function callLumaApi(lumaApiKey: string, visualPrompt: string, aspectRatio: string = "3:4", model: string = "photon-flash-1"): Promise<string> {
    console.log(`Calling Luma API (${model}) with prompt: ${visualPrompt.substring(0, 100)}...`);
    const lumaApiUrl = "https://api.lumalabs.ai/dream-machine/v1/generations/image";

    const payload = {
        prompt: visualPrompt,
        aspect_ratio: aspectRatio,
        model: model,
    };

    const response = await fetch(lumaApiUrl, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${lumaApiKey}`,
            'Content-Type': 'application/json',
            'accept': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    const responseBodyText = await response.text();
    if (!response.ok) {
        console.error(`Luma API Error (${response.status}):`, responseBodyText);
        throw new Error(`Luma API Error (${response.status}): ${responseBodyText}`);
    }

    const initialResponse: LumaGenerationResponse = JSON.parse(responseBodyText);
    console.log(`Luma job submitted. Generation ID: ${initialResponse.id}, State: ${initialResponse.state}`);

    if (!initialResponse.id) {
        throw new Error("Luma API did not return a generation ID.");
    }

    // Start polling for the result
    return await pollLumaResult(lumaApiKey, initialResponse.id);
}

async function pollLumaResult(lumaApiKey: string, generationId: string, maxAttempts = 60, delay = 3000): Promise<string> {
    console.log(`Polling Luma result (ID: ${generationId})...`);
    const pollUrl = `https://api.lumalabs.ai/dream-machine/v1/generations/${generationId}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Poll attempt ${attempt}/${maxAttempts} for ${generationId}`);
        try {
            const response = await fetch(pollUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${lumaApiKey}`,
                    'accept': 'application/json'
                }
            });

            const responseBodyText = await response.text();
            if (!response.ok) {
                console.warn(`Luma Poll Error (${response.status}):`, responseBodyText);
                if (response.status === 401 || response.status === 404) {
                    throw new Error(`Luma Poll Error (${response.status}): ${responseBodyText}`);
                }
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }

            const pollData: LumaGenerationResponse = JSON.parse(responseBodyText);
            console.log(`Luma Poll Status (ID: ${generationId}): ${pollData.state}`);

            if (pollData.state === 'completed') {
                const completedData = pollData as LumaCompletedResponse;
                if (completedData.assets?.image) {
                    console.log(`Polling complete. Image URL found for ${generationId}.`);
                    return completedData.assets.image;
                } else {
                    console.error('Luma generation completed but no image asset found:', completedData);
                    throw new Error('Luma generation completed but the image URL is missing.');
                }
            } else if (pollData.state === 'failed') {
                const failedData = pollData as LumaFailedResponse;
                console.error('Luma generation failed:', failedData);
                throw new Error(`Luma image generation failed: ${failedData.failure_reason || 'Unknown reason'}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, delay));
        } catch (pollError) {
            console.error(`Error during Luma poll attempt ${attempt}:`, pollError);
            if (attempt === maxAttempts) throw pollError;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    throw new Error(`Luma polling timed out after ${maxAttempts} attempts for generation ID: ${generationId}`);
}

// --- Main Function ---
serve(async (req) => {
    if (req.method === 'OPTIONS') return handleCors();

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
    );

    try {
        const { character_id, project_id }: RequestBody = await req.json();
        if (!character_id) return errorResponse('character_id is required', 400);

        console.log(`Generating image for character ID: ${character_id}`);

        // 1. Fetch Character Data (and optional project context)
        let query = supabaseClient
            .from('characters')
            .select(`
                name,
                description,
                project:projects ( genre, tone, video_style, cinematic_inspiration )
            `)
            .eq('id', character_id)
            .single();

        const { data: charData, error: fetchError } = await query;

        if (fetchError || !charData) {
            console.error('Error fetching character:', fetchError?.message);
            return errorResponse('Character not found', 404, fetchError?.message);
        }

        // 2. Generate Visual Prompt using Claude
        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!claudeApiKey) return errorResponse('Server config error: Anthropic key missing', 500);

        const visualPromptSystem = `You are an expert visual concept artist translating character descriptions into detailed image generation prompts for an AI model like Photon Flash or SDXL.
Focus ONLY on visual details. Create a prompt that is a comma-separated list of descriptive keywords and phrases.
Include:
- Core identity (e.g., 'astronaut', 'librarian', 'engineer').
- Key physical features mentioned (hair color/style, eye color, build, notable features). If not mentioned, make reasonable assumptions or state 'average'.
- Age appearance (e.g., 'young adult', 'middle-aged', 'elderly').
- Clothing style based on description or role (e.g., 'sci-fi uniform', 'casual wear', 'lab coat').
- Mood/Expression if implied (e.g., 'determined expression', 'thoughtful gaze', 'subtle smile').
- Visual Style Keywords based on project context (if provided): genre, tone, video style (e.g., 'cinematic lighting', 'film noir shadows', 'anime style', 'photorealistic').
- Aim for a portrait style unless the description implies action. Use 'portrait' keyword.
- Prioritize visual elements. Exclude narrative points or internal thoughts.
- Keep the prompt concise but descriptive. Output *only* the comma-separated prompt string.`;

        let visualPromptUser = `Character Name: ${charData.name}\nDescription: ${charData.description || 'No description provided.'}`;
        if (charData.project) {
            visualPromptUser += `\nProject Context: Genre: ${charData.project.genre || 'N/A'}, Tone: ${charData.project.tone || 'N/A'}, Style: ${charData.project.video_style || 'N/A'}, Inspiration: ${charData.project.cinematic_inspiration || 'N/A'}`;
        }

        const visualPrompt = await callClaudeApi(claudeApiKey, visualPromptSystem, visualPromptUser, 300);
        console.log(`Generated Visual Prompt for ${charData.name}: ${visualPrompt}`);

        // 3. Generate Image using Luma API (instead of Fal.ai)
        const lumaApiKey = Deno.env.get('LUMA_API_KEY');
        if (!lumaApiKey) return errorResponse('Server config error: Luma key missing', 500);

        const imageUrl = await callLumaApi(lumaApiKey, visualPrompt);
        console.log(`Generated Image URL for ${charData.name}: ${imageUrl}`);

        // 4. Update Character Record in Database
        const { error: updateError } = await supabaseClient
            .from('characters')
            .update({ image_url: imageUrl })
            .eq('id', character_id);

        if (updateError) {
            console.error(`Failed to update character ${character_id} with image URL:`, updateError);
            return errorResponse('Failed to save generated image URL', 500, updateError.message);
        }

        console.log(`Successfully updated character ${character_id} with image URL.`);
        return successResponse({ success: true, character_id: character_id, image_url: imageUrl });

    } catch (error) {
        console.error(`Error in generate-character-image:`, error);
        return errorResponse(error.message || 'Failed to generate character image', 500);
    }
});

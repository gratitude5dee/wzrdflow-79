
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

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

// --- Helper Functions ---
async function callClaudeApi(apiKey: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    console.log('Calling Claude API for Visual Prompt...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-3-5-sonnet-20240620', max_tokens: maxTokens, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
    });
    const responseBodyText = await response.text();
    if (!response.ok) throw new Error(`Claude API Error (${response.status}): ${responseBodyText}`);
    const claudeResponse = JSON.parse(responseBodyText);
    const content = claudeResponse.content?.[0]?.text;
    if (!content) throw new Error('Empty response content from Claude API');
    console.log('Claude API call successful (Visual Prompt).');
    return content;
}

async function callFalImageApi(supabaseClient: any, falApiKey: string, visualPrompt: string, aspectRatio: string = "3:4"): Promise<string> {
    console.log('Calling Fal.ai Image API (Photon Flash)...');
    const modelId = 'fal-ai/photon'; // Photon Flash model
    const input = {
        prompt: visualPrompt,
        negative_prompt: "text, signature, watermark, blurry, low quality, deformed, multiple people, ugly",
        aspect_ratio: aspectRatio,
        num_inference_steps: 30,
        guidance_scale: 5,
    };

    // Use the fal-proxy edge function
    const { data: invokeData, error: invokeError } = await supabaseClient.functions.invoke('fal-proxy', {
        body: {
            endpoint: modelId,
            input: input,
            mode: 'queue'
        }
    });

    if (invokeError) {
        console.error('Fal Proxy invoke error:', invokeError);
        throw new Error(`Fal Proxy invoke failed: ${invokeError.message}`);
    }
    if (!invokeData || !invokeData.requestId) {
        console.error('Fal Proxy did not return request ID:', invokeData);
        throw new Error('Failed to get request ID from Fal Proxy');
    }

    console.log(`Fal job queued. Request ID: ${invokeData.requestId}`);

    // Poll for the result using the fal-poll function
    const result = await pollFalResult(supabaseClient, invokeData.requestId);

    // Extract image URL from result
    const imageUrl = result?.images?.[0]?.url;

    if (!imageUrl) {
        console.error('Image URL not found in Fal result:', result);
        throw new Error('Failed to retrieve image URL from Fal.ai result.');
    }
    console.log('Fal.ai Image API call successful.');
    return imageUrl;
}

async function pollFalResult(supabaseClient: any, requestId: string, maxAttempts = 45, delay = 2000): Promise<any> {
    console.log(`Polling for Fal result (Request ID: ${requestId})...`);
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const { data: pollData, error: pollError } = await supabaseClient.functions.invoke('fal-poll', {
            body: { requestId }
        });

        if (pollError) throw new Error(`Polling failed: ${pollError.message}`);
        if (!pollData) throw new Error('Polling returned no data');

        console.log(`Poll attempt ${attempt}: Status - ${pollData.status}`);

        if (pollData.status === 'COMPLETED') {
            console.log('Polling complete. Result received.');
            return pollData.result;
        } else if (pollData.status === 'FAILED') {
            console.error('Fal job failed:', pollData);
            throw new Error('Fal.ai image generation job failed.');
        } else if (pollData.status !== 'IN_PROGRESS' && pollData.status !== 'QUEUED'){
            console.warn(`Unexpected Fal status: ${pollData.status}`);
        }

        await new Promise(resolve => setTimeout(resolve, delay)); // Wait before next poll
    }
    throw new Error(`Polling timed out after ${maxAttempts} attempts for request ID: ${requestId}`);
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

        // 3. Generate Image using Fal.ai (Photon Flash)
        const falApiKey = Deno.env.get('FAL_KEY');
        if (!falApiKey) return errorResponse('Server config error: Fal key missing', 500);

        const imageUrl = await callFalImageApi(supabaseClient, falApiKey, visualPrompt);
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

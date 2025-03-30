
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { callClaudeApi } from '../_shared/claude.ts';

interface RequestBody {
    scene_id: string;
    project_id: string;
}

interface ShotDefinition {
    shot_number: number;
    shot_type: string;
    prompt_idea: string;
    dialogue?: string | null;
    sound_effects?: string | null;
}

interface ShotGenerationResponse {
    shots: ShotDefinition[];
}

function safeParseShotsJson(jsonString: string): ShotGenerationResponse | null {
    try {
        const cleanedString = jsonString.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        const parsed = JSON.parse(cleanedString);
        if (parsed && Array.isArray(parsed.shots)) {
            return parsed as ShotGenerationResponse;
        }
        console.warn('Parsed JSON does not match expected ShotGenerationResponse structure.');
        return null;
    } catch (error) {
        console.warn('Failed to parse shots JSON:', error.message, 'Raw string:', jsonString);
        return null;
    }
}

serve(async (req) => {
    if (req.method === 'OPTIONS') return handleCors();

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
    );

    try {
        const { scene_id, project_id }: RequestBody = await req.json();
        if (!scene_id || !project_id) return errorResponse('scene_id and project_id are required', 400);

        console.log(`Generating shots for Scene ID: ${scene_id}, Project ID: ${project_id}`);

        // 1. Fetch Scene and Project Context
        const { data: sceneData, error: sceneError } = await supabaseClient
            .from('scenes')
            .select('description, location, lighting, weather, title, scene_number, project:projects ( video_style, genre, tone )')
            .eq('id', scene_id)
            .single();

        if (sceneError || !sceneData) return errorResponse('Scene not found', 404, sceneError?.message);

        // 2. Generate Shot Breakdown using Claude
        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!claudeApiKey) return errorResponse('Server config error: Anthropic key missing', 500);

        const shotBreakdownSystemPrompt = `You are a film director's assistant AI. Analyze the provided scene description and context, then break it down into 2-5 distinct, logical camera shots.
For each shot, provide:
- \`shot_number\`: Sequential number starting from 1 within this scene.
- \`shot_type\`: Standard cinematography term (e.g., "Establishing Shot", "Wide Shot", "Medium Shot", "Close Up", "Over the Shoulder", "POV Shot", "Tracking Shot", "Insert Shot").
- \`prompt_idea\`: A concise conceptual description of the main visual element or action for this specific shot. This is NOT the final image prompt, but the core idea.
- \`dialogue\`: Any dialogue spoken *during* this specific shot (null if none).
- \`sound_effects\`: Key sound effects relevant *to this specific shot* (null if none).

Consider the scene's narrative flow, location, lighting, weather, and overall project style/tone when deciding on shots. Output ONLY a single JSON object matching this structure:
\`\`\`json
{
  "shots": [
    {
      "shot_number": 1,
      "shot_type": "...",
      "prompt_idea": "...",
      "dialogue": "...",
      "sound_effects": "..."
    }
    // ... more shot objects (2-5 total)
  ]
}
\`\`\``;

        const shotBreakdownUserPrompt = `Scene Context:
Title: ${sceneData.title || `Scene ${sceneData.scene_number}`}
Description: ${sceneData.description || 'No description.'}
Location: ${sceneData.location || 'Not specified.'}
Lighting: ${sceneData.lighting || 'Not specified.'}
Weather: ${sceneData.weather || 'Not specified.'}
Project Style/Tone: ${sceneData.project?.video_style || 'N/A'}, ${sceneData.project?.genre || 'N/A'}, ${sceneData.project?.tone || 'N/A'}

Break this scene down into 2-5 logical shots in the specified JSON format.`;

        const shotsContent = await callClaudeApi(claudeApiKey, shotBreakdownSystemPrompt, shotBreakdownUserPrompt, 1500);
        const shotsData = safeParseShotsJson(shotsContent);

        if (!shotsData || !shotsData.shots || shotsData.shots.length === 0) {
            return errorResponse('Failed to parse valid shots from AI response', 500, { raw_content: shotsContent });
        }

        console.log(`Generated ${shotsData.shots.length} shot definitions for scene ${scene_id}.`);

        // 3. Save Shots to Database
        const shotsToInsert = shotsData.shots.map(shot => ({
            scene_id: scene_id,
            project_id: project_id,
            shot_number: shot.shot_number,
            shot_type: shot.shot_type,
            prompt_idea: shot.prompt_idea,
            dialogue: shot.dialogue || null,
            sound_effects: shot.sound_effects || null,
            image_status: 'pending'
        }));

        const { data: insertedShots, error: insertError } = await supabaseClient
            .from('shots')
            .insert(shotsToInsert)
            .select('id, shot_number');

        if (insertError) throw insertError;
        console.log(`Saved ${insertedShots?.length || 0} shots to database for scene ${scene_id}.`);

        // 4. Invoke Image Generation for Each Saved Shot
        if (insertedShots && insertedShots.length > 0) {
            console.log(`Queueing image generation for ${insertedShots.length} shots...`);
            for (const shot of insertedShots) {
                try {
                    const { error: invokeError } = await supabaseClient.functions.invoke(
                        'generate-shot-image',
                        { body: { shot_id: shot.id } }
                    );
                    if (invokeError) {
                        console.error(`Failed to invoke generate-shot-image for shot ${shot.shot_number} (${shot.id}):`, invokeError.message);
                    } else {
                        console.log(`Successfully invoked image generation for shot ${shot.shot_number} (${shot.id}).`);
                    }
                } catch (invocationCatchError) {
                    console.error(`Caught error during image generation invocation for shot ${shot.shot_number} (${shot.id}):`, invocationCatchError.message);
                }
            }
        }

        return successResponse({ success: true, scene_id: scene_id, shots_created: insertedShots?.length || 0 });

    } catch (error) {
        console.error(`Error generating shots for scene:`, error);
        return errorResponse(error.message || 'Failed to generate shots for scene', 500);
    }
});

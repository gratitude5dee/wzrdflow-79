import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import { generateStoryline } from '../_shared/claude.ts';

interface RequestBody {
    project_id: string;
    generate_alternative?: boolean;
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return handleCors();
    }

    const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
    );

    try {
        const { project_id, generate_alternative }: RequestBody = await req.json();

        if (!project_id) {
            return errorResponse('Project ID is required', 400);
        }

        const { data: project, error: projectError } = await supabaseClient
            .from('projects')
            .select('title, concept_text, genre, tone, cinematic_inspiration')
            .eq('id', project_id)
            .single();

        if (projectError) {
            return errorResponse('Project not found', 404, projectError.message);
        }

        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!claudeApiKey) {
            return errorResponse('Server configuration error: Anthropic API key missing', 500);
        }

        const { storyline, potential_genre, potential_tone } = await generateStoryline(
            claudeApiKey,
            project.title,
            project.concept_text,
            project.genre,
            project.tone,
            project.cinematic_inspiration,
            generate_alternative
        );

        if (!storyline) {
            return errorResponse('Failed to generate storyline', 500);
        }

        const responseData = JSON.parse(storyline);

        if (!responseData.full_story || !responseData.scene_breakdown) {
            return errorResponse('Invalid storyline format', 500);
        }

        // Save the storyline to the database
        const { data: storylineData, error: storylineError } = await supabaseClient
            .from('storylines')
            .insert({
                project_id: project_id,
                title: `Storyline for ${project.title}`,
                description: 'Generated storyline',
                full_story: responseData.full_story,
                tags: [],
            })
            .select('id')
            .single();

        if (storylineError) {
            console.error('Error saving storyline:', storylineError.message);
        }

        let savedScenes: any[] = [];
        let scene_count = 0;
        
        // After saving scenes
        if (!generate_alternative && responseData.scene_breakdown?.length) {
            // Save scenes to the database
            const scenesToInsert = responseData.scene_breakdown.map(scene => ({
                project_id: project_id,
                storyline_id: storylineData?.id || null,
                scene_number: scene.scene_number,
                title: scene.title,
                description: scene.description,
                location: scene.location,
                lighting: scene.lighting,
                weather: scene.weather,
                voiceover: scene.voiceover,
            }));
            const { data: insertedScenes, error: scenesError } = await supabaseClient
                .from('scenes')
                .insert(scenesToInsert)
                .select('id, scene_number');

            if (scenesError) {
                console.error('Error inserting scenes:', scenesError.message);
            } else {
                savedScenes = insertedScenes || [];
                scene_count = savedScenes.length;
                console.log(`${scene_count} scenes inserted successfully.`);

                // NEW: Invoke Shot Generation for Each Scene
                if (savedScenes.length > 0) {
                    console.log(`Queueing shot generation for ${savedScenes.length} scenes...`);
                    for (const scene of savedScenes) {
                        try {
                            const { error: invokeError } = await supabaseClient.functions.invoke(
                                'generate-shots-for-scene',
                                { body: { scene_id: scene.id, project_id: project_id } }
                            );
                            if (invokeError) {
                                console.error(`Failed to invoke generate-shots-for-scene for scene ${scene.scene_number} (${scene.id}):`, invokeError.message);
                            } else {
                                console.log(`Successfully invoked shot generation for scene ${scene.scene_number} (${scene.id}).`);
                            }
                        } catch (invocationCatchError) {
                            console.error(`Caught error during shot generation invocation for scene ${scene.scene_number} (${scene.id}):`, invocationCatchError.message);
                        }
                    }
                }
            }
        }

        // Process characters
        let character_count = 0;
        if (responseData.characters && Array.isArray(responseData.characters)) {
            character_count = responseData.characters.length;
            for (const character of responseData.characters) {
                const { error: characterError } = await supabaseClient
                    .from('characters')
                    .insert({
                        project_id: project_id,
                        name: character.name,
                        description: character.description,
                        image_url: character.image_url,
                    });

                if (characterError) {
                    console.error('Error saving character:', characterError.message);
                }
            }
        }

        // Update project with inferred genre/tone (if any)
        const updated_settings: string[] = [];
        if (potential_genre && project.genre !== potential_genre) {
            await supabaseClient
                .from('projects')
                .update({ genre: potential_genre })
                .eq('id', project_id);
            updated_settings.push('genre');
        }
        if (potential_tone && project.tone !== potential_tone) {
            await supabaseClient
                .from('projects')
                .update({ tone: potential_tone })
                .eq('id', project_id);
            updated_settings.push('tone');
        }

        return successResponse({
            success: true,
            project_id: project_id,
            storyline_id: storylineData?.id || null,
            character_count: character_count,
            scene_count: scene_count,
            updated_settings: updated_settings,
            potential_genre: potential_genre,
            potential_tone: potential_tone
        });
    } catch (error) {
        console.error('Error generating storyline:', error);
        return errorResponse(error.message || 'Failed to generate storyline', 500);
    }
});

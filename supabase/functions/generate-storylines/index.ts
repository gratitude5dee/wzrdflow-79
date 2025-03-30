
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

// Interfaces for AI Responses
interface StorylineResponseData {
    primary_storyline: {
        title: string;
        description: string;
        tags: string[];
        full_story: string;
    };
    scene_breakdown?: {
        scene_number: number;
        title: string;
        description: string;
        location?: string | null;
        lighting?: string | null;
        weather?: string | null;
    }[];
}

interface AnalysisResponseData {
    characters: {
        name: string;
        description: string;
    }[];
    setting_keywords?: string[];
    potential_genre?: string;
    potential_tone?: string;
}

// Helper to safely parse JSON
function safeParseJson<T>(jsonString: string): T | null {
    try {
        const cleanedString = jsonString.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        return JSON.parse(cleanedString);
    } catch (error1) {
        console.warn('Failed to parse JSON after cleaning markdown:', error1.message);
        try {
            return JSON.parse(jsonString);
        } catch (error2) {
            console.error('Failed to parse JSON directly:', error2.message);
            console.error('Original content being parsed:', jsonString);
            return null;
        }
    }
}

// Helper to call Claude API
async function callClaudeApi(apiKey: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
    console.log('Calling Claude API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620',
            max_tokens: maxTokens,
            system: systemPrompt,
            messages: [{ role: 'user', content: userPrompt }]
        })
    });

    const responseBodyText = await response.text();
    if (!response.ok) {
        console.error('Claude API error:', response.status, responseBodyText);
        throw new Error(`Claude API Error (${response.status}): ${responseBodyText}`);
    }
    
    const claudeResponse = JSON.parse(responseBodyText);
    const content = claudeResponse.content?.[0]?.text;
    if (!content) {
        console.error('Empty content in Claude response:', claudeResponse);
        throw new Error('Empty response content from Claude API');
    }
    console.log('Claude API call successful.');
    return content;
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return handleCors();
    }
    
    try {
        // Authenticate the request
        const user = await authenticateRequest(req.headers);
        
        // Create Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        // Parse request body
        const { project_id, generate_alternative = false } = await req.json();
        if (!project_id) {
            return errorResponse('Project ID is required', 400);
        }
        console.log(`Received request for project ${project_id}. Generate alternative: ${generate_alternative}`);

        // Fetch project details
        const { data: project, error: projectError } = await supabaseClient
            .from('projects')
            .select('title, concept_text, genre, tone, format, custom_format_description, special_requests, product_name, target_audience, main_message, call_to_action')
            .eq('id', project_id)
            .eq('user_id', user.id)
            .single();

        if (projectError || !project) {
            console.error('Project error:', projectError?.message);
            return errorResponse('Project not found or access denied', 404, projectError?.message);
        }

        // Get Anthropic API key
        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!claudeApiKey) {
            console.error('ANTHROPIC_API_KEY not set.');
            return errorResponse('Server configuration error: Anthropic API key not found', 500);
        }

        // Step 1: Generate storyline and scenes
        const storylineSystemPrompt = `You are a professional screenwriter and AI assistant specialized in creative storytelling and video production planning.
Your task is to generate ONE compelling storyline based on the provided project details.
Follow these instructions precisely:
1.  **Storyline Generation:** Create ONE unique storyline. Do NOT provide multiple options unless specifically asked for an alternative.
    *   The storyline should align with the provided concept, genre, tone, and format.
    *   It must have a clear beginning, middle, and end.
${!generate_alternative ? `
2.  **Scene Breakdown:** Based ONLY on the storyline you generated, create a detailed scene breakdown.
    *   Number the scenes sequentially starting from 1.
    *   Generate between 5 and 10 scenes, appropriate for the story's length and format.
    *   For each scene, provide: \`scene_number\`, \`title\`, \`description\`, optional \`location\`, \`lighting\`, \`weather\`.
` : '' }
3.  **Output Format:** Your entire response MUST be a single JSON object. Do NOT include any text outside the JSON structure. The JSON structure must be exactly:
    \`\`\`json
    {
      "primary_storyline": {
        "title": "Storyline Title",
        "description": "One-paragraph summary (max 200 characters).",
        "tags": ["relevant", "keyword", "tags"],
        "full_story": "Detailed story outline (3-5 paragraphs)."
      }${!generate_alternative ? `,
      "scene_breakdown": [
        {
          "scene_number": 1,
          "title": "Scene 1 Title",
          "description": "Detailed scene description...",
          "location": "Location details...",
          "lighting": "Lighting details...",
          "weather": "Weather details..."
        }
        // ... more scene objects
      ]` : '' }
    }
    \`\`\`
Ensure the \`description\` in \`primary_storyline\` is concise (max 200 chars). Make \`full_story\` comprehensive. Tags should be relevant keywords.${!generate_alternative ? ' Ensure all fields in the `scene_breakdown` array adhere to the specified types.' : ''}`;

        const storylineUserPrompt = `${generate_alternative ? 'Please generate a *different* storyline based on the same project details provided previously. Ensure it offers a distinct take or variation. Do NOT include a scene breakdown unless explicitly asked.\n\n' : 'Generate a storyline and scene breakdown for the following project:\n\n'}Project Title: ${project.title || 'Untitled Project'}
Concept/Input: ${project.concept_text || 'No concept provided. Create something imaginative based on other details.'}
Genre: ${project.genre || 'Not specified'}
Tone: ${project.tone || 'Not specified'}
Format: ${project.format || 'Not specified'}
${project.format === 'custom' && project.custom_format_description ? `Custom Format Details: ${project.custom_format_description}\n` : ''}${project.special_requests ? `Special Requests: ${project.special_requests}\n` : ''}${project.product_name ? `Product/Service: ${project.product_name}\n` : ''}${project.target_audience ? `Target Audience: ${project.target_audience}\n` : ''}${project.main_message ? `Main Message: ${project.main_message}\n` : ''}${project.call_to_action ? `Call to Action: ${project.call_to_action}\n` : ''}
Generate ONE storyline ${!generate_alternative ? 'and its corresponding scene breakdown ' : ''}in the specified JSON format.`;

        console.log('Sending request to Anthropic API for storyline generation...');
        const storylineContent = await callClaudeApi(claudeApiKey, storylineSystemPrompt, storylineUserPrompt, generate_alternative ? 1500 : 4000);
        
        const storylineData = safeParseJson<StorylineResponseData>(storylineContent);
        if (!storylineData || !storylineData.primary_storyline) {
            console.error('Failed to parse valid response from Claude:', { raw_content: storylineContent });
            return errorResponse('Failed to parse valid storyline from Claude', 500, { raw_content: storylineContent });
        }

        console.log('Successfully parsed storyline from Claude response');
        const fullStoryText = storylineData.primary_storyline.full_story;

        // Step 2: Analyze storyline for characters and settings (only for main storyline, not alternatives)
        let analysisData: AnalysisResponseData | null = null;
        if (!generate_alternative) {
            try {
                console.log('Analyzing generated storyline for characters and settings...');
                const analysisSystemPrompt = `Analyze the provided story text. Identify the main characters (max 5) and provide a brief description for each (1-2 sentences based *only* on the text). Optionally, list relevant setting/style keywords (max 10), potential genre, and potential tone if strongly implied. Output MUST be a single JSON object matching this exact structure:
\`\`\`json
{
  "characters": [ { "name": "...", "description": "..." } ],
  "setting_keywords": [ "...", "..." ],
  "potential_genre": "...",
  "potential_tone": "..."
}
\`\`\`
If no characters are found, return an empty array for "characters". If optional fields cannot be determined, omit them or set them to null.`;
                const analysisUserPrompt = `Analyze the following story:\n\n${fullStoryText}`;

                const analysisContent = await callClaudeApi(claudeApiKey, analysisSystemPrompt, analysisUserPrompt, 1000);
                analysisData = safeParseJson<AnalysisResponseData>(analysisContent);
                console.log('Analysis complete.', analysisData ? 'Parsed successfully.' : 'Parsing failed.');
            } catch (analysisError) {
                console.warn('Failed to analyze storyline:', analysisError.message);
                // Continue without analysis data if this step fails
            }
        }

        // --- Database Operations ---
        const isSelected = !generate_alternative;

        // If generating the initial selected storyline, deselect others first
        if (isSelected) {
            console.log(`Setting storyline as selected. Deselecting others for project ${project_id}...`);
            const { error: deselectError } = await supabaseClient
                .from('storylines')
                .update({ is_selected: false })
                .eq('project_id', project_id)
                .eq('is_selected', true);
            if (deselectError) {
                console.warn('Failed to deselect previous storylines:', deselectError.message);
            }
        }

        // Insert the new storyline
        console.log(`Inserting storyline (is_selected: ${isSelected})...`);
        const { data: storyline, error: storylineError } = await supabaseClient
            .from('storylines')
            .insert({
                project_id: project_id,
                title: storylineData.primary_storyline.title,
                description: storylineData.primary_storyline.description,
                full_story: storylineData.primary_storyline.full_story,
                tags: storylineData.primary_storyline.tags,
                is_selected: isSelected,
                generated_by: 'claude-3-5-sonnet'
            })
            .select()
            .single();

        if (storylineError) {
            console.error('Error inserting storyline:', storylineError);
            return errorResponse('Failed to save storyline', 500, storylineError.message);
        }
        console.log(`Storyline ${storyline.id} inserted successfully.`);

        // Insert scenes if not an alternative
        let scenes = [];
        let scene_count = 0;
        if (!generate_alternative && storylineData.scene_breakdown && Array.isArray(storylineData.scene_breakdown)) {
            console.log(`Inserting ${storylineData.scene_breakdown.length} scenes for storyline ${storyline.id}...`);
            const scenesToInsert = storylineData.scene_breakdown.map(scene => ({
                project_id: project_id,
                storyline_id: storyline.id,
                scene_number: scene.scene_number,
                title: scene.title,
                description: scene.description,
                location: scene.location || null,
                lighting: scene.lighting || null,
                weather: scene.weather || null
            }));

            const { data: insertedScenes, error: scenesError } = await supabaseClient
                .from('scenes')
                .insert(scenesToInsert)
                .select();

            if (scenesError) {
                console.error('Error inserting scenes:', scenesError);
                // Continue anyway, as the main operation succeeded
            } else {
                scenes = insertedScenes || [];
                scene_count = scenes.length;
                console.log(`${scene_count} scenes inserted successfully.`);
            }
        }

        // Insert characters if analysis provided them
        let characters = [];
        if (!generate_alternative && analysisData?.characters && analysisData.characters.length > 0) {
            console.log(`Inserting ${analysisData.characters.length} characters from analysis...`);
            const charactersToInsert = analysisData.characters.map(char => ({
                project_id: project_id,
                name: char.name,
                description: char.description
            }));

            const { data: insertedCharacters, error: charactersError } = await supabaseClient
                .from('characters')
                .insert(charactersToInsert)
                .select();

            if (charactersError) {
                console.error('Error inserting characters:', charactersError);
                // Continue anyway, as this is an optional enhancement
            } else {
                characters = insertedCharacters || [];
                console.log(`${characters.length} characters inserted successfully.`);
            }
        }

        // Update project with selected storyline and potentially inferred settings
        const projectUpdates: Record<string, any> = {};
        if (isSelected) {
            projectUpdates.selected_storyline_id = storyline.id;
            
            // Only update genre/tone if they were empty and analysis provided them
            if (!project.genre && analysisData?.potential_genre) {
                projectUpdates.genre = analysisData.potential_genre;
            }
            if (!project.tone && analysisData?.potential_tone) {
                projectUpdates.tone = analysisData.potential_tone;
            }
        }

        if (Object.keys(projectUpdates).length > 0) {
            console.log('Updating project with:', projectUpdates);
            const { error: projectUpdateError } = await supabaseClient
                .from('projects')
                .update(projectUpdates)
                .eq('id', project_id);

            if (projectUpdateError) {
                console.warn('Error updating project:', projectUpdateError.message);
            }
        }

        return successResponse({
            success: true,
            storyline_id: storyline.id,
            scene_count: scene_count,
            character_count: characters.length,
            is_alternative: generate_alternative,
            updated_settings: Object.keys(projectUpdates).filter(k => k !== 'selected_storyline_id')
        });

    } catch (error) {
        console.error('Error in generate-storylines function:', error);
        if (error instanceof AuthError) {
            return errorResponse(error.message, 401);
        }
        if (error instanceof SyntaxError) {
            console.error('JSON Parsing Error:', error.message);
            return errorResponse('Failed to parse request body or API response', 400, { detail: error.message });
        }
        return errorResponse(error.message || 'Internal server error', 500);
    }
});

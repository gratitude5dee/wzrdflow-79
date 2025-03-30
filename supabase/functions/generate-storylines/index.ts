
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

// Define the expected structure for the Claude response
interface ClaudeResponseData {
    primary_storyline: {
        title: string;
        description: string;
        tags: string[];
        full_story: string;
    };
    scene_breakdown: {
        scene_number: number;
        title: string;
        description: string;
        location?: string | null;
        lighting?: string | null;
        weather?: string | null;
    }[];
}

// Helper to safely parse JSON, potentially removing markdown fences
function safeParseJson(jsonString: string): ClaudeResponseData | null {
    try {
        // Attempt 1: Remove potential markdown fences and parse
        const cleanedString = jsonString.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
        return JSON.parse(cleanedString);
    } catch (error1) {
        console.warn('Failed to parse JSON after cleaning markdown:', error1.message);
        try {
            // Attempt 2: Parse the original string directly
            return JSON.parse(jsonString);
        } catch (error2) {
            console.error('Failed to parse JSON directly:', error2.message);
            console.error('Original content:', jsonString); // Log the problematic content
            return null; // Return null if parsing fails completely
        }
    }
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
            // @ts-ignore
            Deno.env.get('SUPABASE_URL') ?? '',
            // @ts-ignore
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

        // Get Anthropic API key from environment
        const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
        if (!claudeApiKey) {
            console.error('ANTHROPIC_API_KEY not set in environment variables.');
            return errorResponse('Server configuration error: Anthropic API key not found', 500);
        }

        // Construct prompt for Claude
        const systemPrompt = `You are a professional screenwriter and AI assistant specialized in creative storytelling and video production planning.
Your task is to generate ONE compelling storyline based on the provided project details AND create a detailed scene breakdown for that specific storyline.

Follow these instructions precisely:
1.  **Storyline Generation:** Create ONE unique storyline. Do NOT provide multiple options.
    *   The storyline should align with the provided concept, genre, tone, and format.
    *   It must have a clear beginning, middle, and end.
2.  **Scene Breakdown:** Based ONLY on the storyline you generated, create a detailed scene breakdown.
    *   Number the scenes sequentially starting from 1.
    *   Generate between 5 and 10 scenes, appropriate for the story's length and format (e.g., fewer for a commercial, more for a short film).
    *   For each scene, provide:
        *   \`scene_number\` (integer)
        *   \`title\` (string): A concise title for the scene.
        *   \`description\` (string): A detailed description of the action, dialogue cues, mood, and key visuals.
        *   \`location\` (string, optional): A specific location (e.g., "INT. COFFEE SHOP - DAY"). Infer if not provided.
        *   \`lighting\` (string, optional): Description of lighting (e.g., "Warm afternoon sun", "Moody, low-key"). Infer if not provided.
        *   \`weather\` (string, optional): Relevant weather conditions (e.g., "Rainy", "Clear sky"). Infer if not provided.
3.  **Output Format:** Your entire response MUST be a single JSON object. Do NOT include any text outside the JSON structure. The JSON structure must be exactly:
    \`\`\`json
    {
      "primary_storyline": {
        "title": "Storyline Title",
        "description": "One-paragraph summary (max 200 characters).",
        "tags": ["relevant", "keyword", "tags"],
        "full_story": "Detailed story outline (3-5 paragraphs)."
      },
      "scene_breakdown": [
        {
          "scene_number": 1,
          "title": "Scene 1 Title",
          "description": "Detailed scene description...",
          "location": "Location details...",
          "lighting": "Lighting details...",
          "weather": "Weather details..."
        },
        // ... more scene objects
      ]
    }
    \`\`\`
Ensure the \`description\` in \`primary_storyline\` is concise (max 200 chars). Make \`full_story\` comprehensive. Tags should be relevant keywords. Ensure all fields in the \`scene_breakdown\` array adhere to the specified types.`;

        const userPrompt = `Generate a storyline and scene breakdown for the following project:
Project Title: ${project.title || 'Untitled Project'}
Concept/Input: ${project.concept_text || 'No concept provided. Create something imaginative based on other details.'}
Genre: ${project.genre || 'Not specified'}
Tone: ${project.tone || 'Not specified'}
Format: ${project.format || 'Not specified'}
${project.format === 'custom' && project.custom_format_description ? `Custom Format Details: ${project.custom_format_description}` : ''}
${project.special_requests ? `Special Requests: ${project.special_requests}` : ''}
${project.product_name ? `Product/Service: ${project.product_name}` : ''}
${project.target_audience ? `Target Audience: ${project.target_audience}` : ''}
${project.main_message ? `Main Message: ${project.main_message}` : ''}
${project.call_to_action ? `Call to Action: ${project.call_to_action}` : ''}

Generate ONE storyline and its corresponding scene breakdown in the specified JSON format.`;

        console.log('Sending request to Anthropic API...');
        
        // Call Anthropic Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': claudeApiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Using the existing model for consistency
                max_tokens: 4000,
                system: systemPrompt,
                messages: [{ role: 'user', content: userPrompt }]
            })
        });

        const responseBodyText = await response.text(); // Read body once

        if (!response.ok) {
            console.error('Claude API error:', response.status, responseBodyText);
            return errorResponse(`Failed to generate storyline (HTTP ${response.status})`, 500, responseBodyText);
        }

        const claudeResponse = JSON.parse(responseBodyText); // Parse the read body
        console.log('Claude response received, extracting content...');

        // Extract the content from Claude's response
        const content = claudeResponse.content?.[0]?.text;
        if (!content) {
            console.error('Empty content in Claude response:', claudeResponse);
            return errorResponse('Empty response from Claude API', 500);
        }

        // Parse JSON safely
        const responseData: ClaudeResponseData | null = safeParseJson(content);

        if (!responseData) {
            return errorResponse('Failed to parse response from Claude', 500, { raw_content: content });
        }

        // Validate structure
        if (!responseData.primary_storyline || !Array.isArray(responseData.scene_breakdown)) {
            console.error('Unexpected format from Claude API:', responseData);
            return errorResponse('Unexpected format from Claude API', 500, { received: responseData });
        }

        console.log('Successfully parsed storyline and scenes from Claude response');

        // Determine if this is the initial storyline or an alternative
        const isSelected = !generate_alternative;

        // If it's the initial selected storyline, deselect any existing selected ones first
        if (isSelected) {
            console.log(`Setting storyline as selected. Deselecting others for project ${project_id}...`);
            const { error: deselectError } = await supabaseClient
                .from('storylines')
                .update({ is_selected: false })
                .eq('project_id', project_id)
                .eq('is_selected', true);

            if (deselectError) {
                console.warn('Failed to deselect previous storylines:', deselectError.message);
                // Continue anyway, as inserting the new one is more critical
            }
        }

        // Insert the new storyline
        console.log(`Inserting storyline (is_selected: ${isSelected})...`);
        const { data: storyline, error: storylineError } = await supabaseClient
            .from('storylines')
            .insert({
                project_id: project_id,
                title: responseData.primary_storyline.title,
                description: responseData.primary_storyline.description,
                full_story: responseData.primary_storyline.full_story,
                tags: responseData.primary_storyline.tags,
                is_selected: isSelected,
                generated_by: 'claude-3-haiku' // Record the model used
            })
            .select()
            .single();

        if (storylineError) {
            console.error('Error inserting storyline:', storylineError);
            return errorResponse('Failed to save storyline', 500, storylineError.message);
        }
        console.log(`Storyline ${storyline.id} inserted successfully.`);

        // Insert scenes linked to the new storyline
        if (responseData.scene_breakdown.length > 0) {
            console.log(`Inserting ${responseData.scene_breakdown.length} scenes for storyline ${storyline.id}...`);
            const scenesToInsert = responseData.scene_breakdown.map(scene => ({
                project_id: project_id,
                storyline_id: storyline.id,
                scene_number: scene.scene_number,
                title: scene.title,
                description: scene.description,
                location: scene.location || null,
                lighting: scene.lighting || null,
                weather: scene.weather || null
            }));

            const { data: scenes, error: scenesError } = await supabaseClient
                .from('scenes')
                .insert(scenesToInsert)
                .select();

            if (scenesError) {
                console.error('Error inserting scenes:', scenesError);
                // Attempt to clean up the storyline if scenes failed? Or just report error?
                // For now, just report the error but the storyline might remain.
                return errorResponse('Failed to save scenes', 500, scenesError.message);
            }
            console.log(`${scenes?.length ?? 0} scenes inserted successfully.`);

            // If this was the initial selected storyline, update the project record
            if (isSelected) {
                console.log(`Updating project ${project_id} to select storyline ${storyline.id}...`);
                const { error: projectUpdateError } = await supabaseClient
                    .from('projects')
                    .update({ selected_storyline_id: storyline.id })
                    .eq('id', project_id);

                if (projectUpdateError) {
                    console.warn('Error updating project with selected storyline:', projectUpdateError.message);
                    // Non-critical, proceed
                }
            }

            return successResponse({
                success: true,
                storyline: storyline,
                scenes: scenes,
                scene_count: scenes?.length ?? 0,
                is_alternative: generate_alternative
            });

        } else {
            console.warn('No scenes were generated in the breakdown.');
            // Return success but indicate no scenes were created
            return successResponse({
                success: true,
                storyline: storyline,
                scenes: [],
                scene_count: 0,
                is_alternative: generate_alternative,
                message: "Storyline generated, but no scenes were included in the breakdown."
            });
        }

    } catch (error) {
        console.error('Error in generate-storylines function:', error);
        
        if (error instanceof AuthError) {
            return errorResponse(error.message, 401);
        }
        
        // Log specific JSON parsing errors if they occur
        if (error instanceof SyntaxError) {
             console.error('JSON Parsing Error:', error.message);
             return errorResponse('Failed to parse request body or API response', 400, { detail: error.message });
        }
        
        return errorResponse(error.message || 'Internal server error', 500);
    }
});


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

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
    const { project_id } = await req.json();

    if (!project_id) {
      return errorResponse('Project ID is required', 400);
    }

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
      return errorResponse('Anthropic API key not found', 500);
    }

    // Construct updated prompt for Claude that requests one storyline and scene breakdown
    const systemPrompt = `You are a professional screenwriter and storyteller.
Based on the concept, genre, tone, and format provided, you will:
1. Generate ONE compelling primary storyline
2. Create a detailed scene breakdown for that storyline

Your response must be in JSON format with the following structure:
{
  "primary_storyline": {
    "title": "Title of the storyline",
    "description": "A short one-paragraph summary of the storyline (max 200 characters)",
    "tags": ["tag1", "tag2", "tag3"],
    "full_story": "A detailed story outline in 3-5 paragraphs"
  },
  "scene_breakdown": [
    {
      "scene_number": 1,
      "title": "Scene title",
      "description": "Detailed description of what happens in the scene",
      "location": "Where the scene takes place, if applicable",
      "lighting": "Lighting details, if relevant",
      "weather": "Weather conditions, if relevant"
    },
    ...more scenes...
  ]
}

Ensure your primary storyline fits the requested genre, tone, and format. For the scene breakdown:
- Create logical scenes that flow naturally and advance the storyline
- Include 5-10 scenes depending on the complexity of the story
- Add sufficient detail in each scene description to guide content creation
- Infer location, lighting, and weather information where appropriate`;

    const userPrompt = `Create one primary storyline and scene breakdown for my project with these details:
Title: ${project.title || 'Untitled Project'}
Concept: ${project.concept_text || 'No concept provided'}
Genre: ${project.genre || 'Not specified'}
Tone: ${project.tone || 'Not specified'}
Format: ${project.format || 'Not specified'}${project.format === 'custom' ? `\nCustom Format Description: ${project.custom_format_description || 'Not specified'}` : ''}${project.special_requests ? `\nSpecial Requests: ${project.special_requests}` : ''}
${project.product_name ? `Product Name: ${project.product_name}` : ''}
${project.target_audience ? `Target Audience: ${project.target_audience}` : ''}
${project.main_message ? `Main Message: ${project.main_message}` : ''}
${project.call_to_action ? `Call to Action: ${project.call_to_action}` : ''}

Please provide a cohesive storyline with an engaging narrative and a detailed scene-by-scene breakdown.`;

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
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', errorText);
      return errorResponse('Failed to generate storyline and scenes', 500, errorText);
    }

    const claudeResponse = await response.json();
    console.log('Claude response received, extracting content...');

    // Extract the content from Claude's response
    const content = claudeResponse.content?.[0]?.text;
    if (!content) {
      return errorResponse('Empty response from Claude API', 500);
    }

    // Extract JSON from content - Claude might wrap it in ```json ... ``` or other markdown
    let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    let responseData;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        responseData = JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error('Failed to parse JSON from code block:', error);
        // Try to parse the entire response as JSON
        try {
          responseData = JSON.parse(content);
        } catch (error) {
          console.error('Failed to parse entire content as JSON:', error);
          return errorResponse('Failed to parse response from Claude', 500);
        }
      }
    } else {
      // Try to parse the entire response as JSON
      try {
        responseData = JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse content as JSON:', error);
        return errorResponse('Failed to parse response from Claude', 500, { content });
      }
    }

    // Validate that the response has the expected structure
    if (!responseData.primary_storyline || !Array.isArray(responseData.scene_breakdown)) {
      return errorResponse('Unexpected format from Claude API', 500, { received: responseData });
    }

    console.log('Successfully parsed storyline and scenes from Claude response');

    // Start a transaction to insert both storyline and scenes
    // First, insert the primary storyline
    const { data: storyline, error: storylineError } = await supabaseClient
      .from('storylines')
      .insert({
        project_id: project_id,
        title: responseData.primary_storyline.title,
        description: responseData.primary_storyline.description,
        full_story: responseData.primary_storyline.full_story,
        tags: responseData.primary_storyline.tags,
        is_selected: true // Set as selected by default
      })
      .select()
      .single();

    if (storylineError) {
      console.error('Error inserting storyline:', storylineError);
      return errorResponse('Failed to save storyline', 500, storylineError.message);
    }

    // Next, insert all scenes with reference to the project and storyline
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
      return errorResponse('Failed to save scenes', 500, scenesError.message);
    }

    // Set this storyline as the selected one in the project
    const { error: projectUpdateError } = await supabaseClient
      .from('projects')
      .update({ selected_storyline_id: storyline.id })
      .eq('id', project_id);

    if (projectUpdateError) {
      console.error('Error updating project with selected storyline:', projectUpdateError);
      // This is not critical, so we continue even if it fails
    }

    return successResponse({ 
      success: true, 
      storyline: storyline,
      scenes: scenes,
      scene_count: scenes.length
    });
  } catch (error) {
    console.error('Error in generate-storylines function:', error);
    
    // Handle authentication errors specifically
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    // Handle other errors
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

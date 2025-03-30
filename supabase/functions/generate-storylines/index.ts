
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
      .select('title, concept_text, genre, tone, format, custom_format_description, special_requests')
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

    // Construct prompt for Claude
    const systemPrompt = `You are a professional screenwriter and storyteller.
Generate 3 distinct and compelling storyline options based on the concept, genre, tone, and format provided.
Your response should be in JSON format with the following structure:
[
  {
    "title": "Title of the storyline",
    "description": "A short one-paragraph summary of the storyline (max 200 characters)",
    "tags": ["tag1", "tag2", "tag3"],
    "full_story": "A detailed story outline in 3-5 paragraphs"
  },
  ...
]
Be creative and provide variety in the storylines so the user has distinct options to choose from.
Ensure each storyline fits the requested genre, tone, and format.`;

    const userPrompt = `Generate 3 storyline options for my project with these details:
Title: ${project.title || 'Untitled Project'}
Concept: ${project.concept_text || 'No concept provided'}
Genre: ${project.genre || 'Not specified'}
Tone: ${project.tone || 'Not specified'}
Format: ${project.format || 'Not specified'}${project.format === 'custom' ? `\nCustom Format Description: ${project.custom_format_description || 'Not specified'}` : ''}${project.special_requests ? `\nSpecial Requests: ${project.special_requests}` : ''}

Please provide three distinct storylines that match these requirements.`;

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
      return errorResponse('Failed to generate storylines', 500, errorText);
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
    let storylinesJson;
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        storylinesJson = JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.error('Failed to parse JSON from code block:', error);
        // Try to parse the entire response as JSON
        try {
          storylinesJson = JSON.parse(content);
        } catch (error) {
          console.error('Failed to parse entire content as JSON:', error);
          return errorResponse('Failed to parse storylines from Claude response', 500);
        }
      }
    } else {
      // Try to parse the entire response as JSON
      try {
        storylinesJson = JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse content as JSON:', error);
        return errorResponse('Failed to parse storylines from Claude response', 500, { content });
      }
    }

    if (!Array.isArray(storylinesJson)) {
      return errorResponse('Unexpected format from Claude API', 500, { received: storylinesJson });
    }

    console.log(`Successfully parsed ${storylinesJson.length} storylines from Claude response`);

    // Store storylines in the database
    const savedStorylines = [];
    for (const storyline of storylinesJson) {
      const { error: insertError, data: newStoryline } = await supabaseClient
        .from('storylines')
        .insert({
          project_id: project_id,
          title: storyline.title,
          description: storyline.description,
          full_story: storyline.full_story,
          tags: storyline.tags,
          is_selected: false // None selected by default
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting storyline:', insertError);
      } else {
        savedStorylines.push(newStoryline);
      }
    }

    return successResponse({ 
      success: true, 
      storylines: savedStorylines,
      total: savedStorylines.length
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

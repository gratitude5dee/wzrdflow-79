
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: authError?.message }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const { project_id } = await req.json();

    if (!project_id) {
      return new Response(
        JSON.stringify({ error: 'Project ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch project details
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('title, concept_text, genre, tone, format, custom_format_description, special_requests')
      .eq('id', project_id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ error: 'Project not found or access denied', details: projectError?.message }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get Anthropic API key from environment
    const claudeApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!claudeApiKey) {
      return new Response(
        JSON.stringify({ error: 'Anthropic API key not found' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
      return new Response(
        JSON.stringify({ error: 'Failed to generate storylines', details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const claudeResponse = await response.json();
    console.log('Claude response received, extracting content...');

    // Extract the content from Claude's response
    const content = claudeResponse.content?.[0]?.text;
    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Empty response from Claude API' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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
          return new Response(
            JSON.stringify({ error: 'Failed to parse storylines from Claude response' }),
            {
              status: 500,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
    } else {
      // Try to parse the entire response as JSON
      try {
        storylinesJson = JSON.parse(content);
      } catch (error) {
        console.error('Failed to parse content as JSON:', error);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to parse storylines from Claude response',
            content: content 
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    if (!Array.isArray(storylinesJson)) {
      return new Response(
        JSON.stringify({ 
          error: 'Unexpected format from Claude API', 
          received: storylinesJson 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        storylines: savedStorylines,
        total: savedStorylines.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-storylines function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

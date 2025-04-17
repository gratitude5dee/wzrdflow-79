
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest } from '../_shared/auth.ts';
import { corsHeaders, errorResponse, successResponse, handleCors } from '../_shared/response.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    // Authenticate the request
    await authenticateRequest(req.headers);

    // Get the GROQ API key from environment
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      return errorResponse('GROQ_API_KEY is not configured', 500);
    }

    // Parse the request body
    const { prompt, model, temperature = 0.7, maxTokens = 1024 } = await req.json();

    if (!prompt) {
      return errorResponse('prompt is required', 400);
    }

    if (!model) {
      return errorResponse('model is required', 400);
    }

    console.log('Making request to Groq API with model:', model);

    // Make request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature,
        max_tokens: maxTokens
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Groq API error:', error);
      return errorResponse(error.error?.message || 'Failed to generate text', response.status);
    }

    const data = await response.json();
    return successResponse({
      text: data.choices[0].message.content,
      usage: data.usage
    });

  } catch (error) {
    console.error('Error in groq-chat function:', error);
    return errorResponse(error.message || 'Internal server error', 500);
  }
});

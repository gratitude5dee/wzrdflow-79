
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { ModelType } from '@/types/modelTypes';

async function pollResult(requestId: string, session: any): Promise<any> {
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  
  while (attempts < maxAttempts) {
    try {
      console.log('Polling for result, attempt:', attempts + 1);
      
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/fal-poll`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ requestId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Poll request failed:', response.status, errorText);
        throw new Error(`Poll request failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Poll response:', data);
      
      if (data.status === 'COMPLETED') {
        return data.result;
      } else if (data.status === 'FAILED') {
        throw new Error('Generation failed');
      }

      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000));
      attempts++;
    } catch (error) {
      console.error('Poll attempt failed:', error);
      throw error;
    }
  }

  throw new Error('Timeout waiting for result');
}

export const generateText = async (prompt: string, selectedModel: ModelType) => {
  try {
    // Get the Supabase session for authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Authentication required');
    }

    console.log('Making initial request with:', { prompt, selectedModel });

    // Make initial request to the Edge Function
    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/fal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          modelId: 'fal-ai/ideogram/v2',
          input: {
            prompt,
            model: selectedModel,
            mode: 'queue',  // Explicitly set queue mode
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Initial request failed:', response.status, errorText);
      let errorMessage;
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error || 'Failed to generate text';
      } catch (e) {
        errorMessage = `Failed to generate text: ${errorText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Initial response:', data);

    if (!data.requestId) {
      console.error('No request ID received:', data);
      throw new Error('No request ID received');
    }

    // Poll for the result
    return await pollResult(data.requestId, session);
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
};

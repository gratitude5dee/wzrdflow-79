
import { supabase, SUPABASE_URL } from "@/integrations/supabase/client";
import { ModelType } from '@/types/modelTypes';

async function pollResult(requestId: string, session: any): Promise<any> {
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  
  while (attempts < maxAttempts) {
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
      throw new Error('Failed to poll for results');
    }

    const data = await response.json();
    
    if (data.status === 'COMPLETED') {
      return data.result;
    } else if (data.status === 'FAILED') {
      throw new Error('Generation failed');
    }

    // Wait 2 seconds before next poll
    await new Promise(resolve => setTimeout(resolve, 2000));
    attempts++;
  }

  throw new Error('Timeout waiting for result');
}

export const generateText = async (prompt: string, selectedModel: ModelType) => {
  // Get the Supabase session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication required');
  }

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
        modelId: 'fal-ai/any-llm',
        input: {
          prompt,
          model: selectedModel,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    try {
      const error = JSON.parse(errorText);
      errorMessage = error.error || 'Failed to generate text';
    } catch (e) {
      errorMessage = `Failed to generate text: ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const { requestId } = await response.json();
  if (!requestId) {
    throw new Error('No request ID received');
  }

  // Poll for the result
  const result = await pollResult(requestId, session);
  return result;
};

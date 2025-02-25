
import { ModelType } from '@/types/modelTypes';

async function pollResult(requestId: string): Promise<any> {
  let attempts = 0;
  const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max wait
  
  while (attempts < maxAttempts) {
    try {
      console.log('Polling for result, attempt:', attempts + 1);
      
      const falKey = localStorage.getItem('falKey');
      if (!falKey) {
        throw new Error('FAL_KEY not found. Please set your API key first.');
      }

      const response = await fetch(`https://fal.run/v1/queue/status/${requestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Key ${falKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Poll request failed:', response.status, errorText);
        throw new Error(`Poll request failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Poll response:', data);
      
      if (data.status === 'COMPLETED') {
        return data.logs?.[data.logs.length - 1]?.result || data.result;
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
    const falKey = localStorage.getItem('falKey');
    if (!falKey) {
      throw new Error('FAL_KEY not found. Please set your API key first.');
    }

    console.log('Making initial request with:', { prompt, selectedModel });

    // Make direct request to Fal.ai
    const response = await fetch(
      `https://fal.run/v1/fal-ai/ideogram/v2`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${falKey}`,
        },
        body: JSON.stringify({
          prompt,
          model: selectedModel,
          mode: 'queue',
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

    const requestId = data.request_id;
    if (!requestId) {
      console.error('No request ID received:', data);
      throw new Error('No request ID received');
    }

    // Poll for the result
    return await pollResult(requestId);
  } catch (error) {
    console.error('Generation error:', error);
    throw error;
  }
};

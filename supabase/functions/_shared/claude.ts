
/**
 * Shared helper functions for Claude API interactions
 */

// Helper to safely parse JSON
export function safeParseJson<T>(jsonString: string): T | null {
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
export async function callClaudeApi(apiKey: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
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

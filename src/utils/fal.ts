
import { supabase } from '@/integrations/supabase/client';

interface FalRequestOptions {
  path: string;
  method?: 'GET' | 'POST' | 'PUT';
  body?: any;
}

export async function falRequest({ path, method = 'POST', body }: FalRequestOptions) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fal${path}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        ...(body && { body: JSON.stringify(body) }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to make fal.ai request');
    }

    return await response.json();
  } catch (error) {
    console.error('Fal.ai request failed:', error);
    throw error;
  }
}

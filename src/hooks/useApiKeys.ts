
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface ApiKeys {
  lumaApiKey: string | null;
  claudeApiKey: string | null;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchApiKeys = async () => {
    if (!user) {
      setApiKeys(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      const { data, error } = await supabase.functions.invoke('get-api-keys', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      
      if (error) throw error;
      
      setApiKeys({
        lumaApiKey: data.luma_api_key,
        claudeApiKey: data.claude_api_key
      });
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const storeApiKeys = async (lumaApiKey: string | null, claudeApiKey: string | null) => {
    if (!user) {
      toast.error('You must be logged in to store API keys');
      return false;
    }

    try {
      // Get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }
      
      const { error } = await supabase.functions.invoke('store-api-keys', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          luma_api_key: lumaApiKey,
          claude_api_key: claudeApiKey
        }
      });
      
      if (error) throw error;
      
      // Update local state
      setApiKeys({
        lumaApiKey,
        claudeApiKey
      });
      
      toast.success('API keys stored successfully');
      return true;
    } catch (error) {
      console.error('Error storing API keys:', error);
      toast.error('Failed to store API keys');
      return false;
    }
  };
  
  const clearApiKeys = async () => {
    return await storeApiKeys(null, null);
  };

  // Initialize
  useEffect(() => {
    fetchApiKeys();
  }, [user]);

  return {
    apiKeys,
    isLoading,
    storeApiKeys,
    clearApiKeys,
    refreshApiKeys: fetchApiKeys
  };
};

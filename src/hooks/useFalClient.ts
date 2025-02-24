
import { useEffect, useState } from 'react';
import { fal } from '@fal-ai/client';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from "@/providers/AuthProvider";

export const useFalClient = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const initializeFalClient = async () => {
      try {
        if (!user) {
          setIsError(true);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
          setIsError(true);
          return;
        }

        // Get FAL_KEY from Supabase function
        const { data, error: invokeError } = await supabase.functions.invoke('get-secret', {
          body: { name: 'FAL_KEY' },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
          }
        });

        if (invokeError || !data?.value) {
          console.error('Error fetching FAL_KEY:', invokeError);
          setIsError(true);
          return;
        }

        // Configure the FAL client with the key from Supabase
        fal.config({
          credentials: data.value
        });
        
        console.log('Fal.ai client initialized with Supabase secret');
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize fal.ai client:', err);
        setIsError(true);
      }
    };

    initializeFalClient();
  }, [toast, user]);

  return { isInitialized, isError };
};

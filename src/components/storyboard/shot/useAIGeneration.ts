
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageStatus } from '@/types/storyboardTypes';

interface AIGenerationProps {
  shotId: string;
  isGeneratingRef: React.MutableRefObject<boolean>;
  setIsGeneratingPrompt: (value: boolean) => void;
  setIsGeneratingImage: (value: boolean) => void;
  setLocalVisualPrompt: (value: string) => void;
  setLocalImageStatus: (value: ImageStatus) => void;
  localVisualPrompt: string;
}

export const useAIGeneration = ({
  shotId,
  isGeneratingRef,
  setIsGeneratingPrompt,
  setIsGeneratingImage,
  setLocalVisualPrompt,
  setLocalImageStatus,
  localVisualPrompt
}: AIGenerationProps) => {
  
  const handleGenerateVisualPrompt = async () => {
    if (!shotId) {
      toast.error("Cannot generate prompt: Shot ID is missing.");
      return;
    }
    setIsGeneratingPrompt(true);
    isGeneratingRef.current = true;
    try {
      const { data, error } = await supabase.functions.invoke('generate-visual-prompt', {
        body: { shot_id: shotId }
      });

      if (error) throw error;

      if (data?.success && data.visual_prompt) {
        setLocalVisualPrompt(data.visual_prompt); // Update local state immediately
        toast.success("Visual prompt generated!");
        // No need to call onUpdate, the function updated the DB
      } else {
        throw new Error(data?.error || "Failed to generate visual prompt.");
      }
    } catch (error: any) {
      console.error("Error generating visual prompt:", error);
      toast.error(`Prompt generation failed: ${error.message}`);
    } finally {
      setIsGeneratingPrompt(false);
      isGeneratingRef.current = false;
    }
  };

  const handleGenerateImage = async () => {
    if (!shotId) {
      toast.error("Cannot generate image: Shot ID is missing.");
      return;
    }
    if (!localVisualPrompt) {
      toast.warning("Please generate or enter a visual prompt first.");
      return;
    }

    setIsGeneratingImage(true);
    setLocalImageStatus('generating'); // Optimistic UI update
    isGeneratingRef.current = true;

    try {
      const { data, error } = await supabase.functions.invoke('generate-shot-image', {
        body: { shot_id: shotId }
      });

      if (error) {
        setLocalImageStatus('failed');
        throw error;
      }

      if (data?.success && data.image_url) {
        toast.success("Image generated successfully!");
      } else {
        setLocalImageStatus('failed');
        throw new Error(data?.error || "Image generation failed to start or complete.");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(`Image generation failed: ${error.message}`);
      setLocalImageStatus('failed');
    } finally {
      isGeneratingRef.current = false;
      // Re-check status after the call in case it completed very quickly
      const { data: currentState } = await supabase
        .from('shots')
        .select('image_status, image_url')
        .eq('id', shotId)
        .single();
        
      if (currentState) {
        // Make sure we handle the type correctly
        const updatedStatus: ImageStatus = (currentState.image_status || 'failed') as ImageStatus;
        setLocalImageStatus(updatedStatus);
        setIsGeneratingImage(updatedStatus === 'generating');
      }
    }
  };

  return {
    handleGenerateVisualPrompt,
    handleGenerateImage
  };
};

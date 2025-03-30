
import { useState, useRef, useEffect } from 'react';
import { ShotDetails, ImageStatus } from '@/types/storyboardTypes';
import { useDebounce } from '@/hooks/use-debounce';

export const useShotCardState = (shot: ShotDetails, onUpdate: (updates: Partial<ShotDetails>) => Promise<void>) => {
  // Local state for form values
  const [shotType, setShotType] = useState(shot.shot_type || null);
  const [promptIdea, setPromptIdea] = useState(shot.prompt_idea || null);
  const [dialogue, setDialogue] = useState(shot.dialogue || null);
  const [soundEffects, setSoundEffects] = useState(shot.sound_effects || null);
  const [localVisualPrompt, setLocalVisualPrompt] = useState(shot.visual_prompt || '');
  const [localImageUrl, setLocalImageUrl] = useState(shot.image_url || null);
  const [localImageStatus, setLocalImageStatus] = useState<ImageStatus>(shot.image_status || 'pending');
  
  // UI state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(shot.image_status === 'generating');
  const isGeneratingRef = useRef<boolean>(false);

  // Update local state when props change (e.g., initial load)
  useEffect(() => {
    setShotType(shot.shot_type || null);
    setPromptIdea(shot.prompt_idea || null);
    setDialogue(shot.dialogue || null);
    setSoundEffects(shot.sound_effects || null);
    setLocalVisualPrompt(shot.visual_prompt || '');
    setLocalImageUrl(shot.image_url || null);
    setLocalImageStatus(shot.image_status || 'pending');
    setIsGeneratingImage(shot.image_status === 'generating');
  }, [shot.id, shot.shot_type, shot.prompt_idea, shot.dialogue, shot.sound_effects, 
      shot.visual_prompt, shot.image_url, shot.image_status]);

  // Use debounce for field updates to reduce API calls
  const debouncedShotType = useDebounce(shotType, 1000);
  const debouncedPromptIdea = useDebounce(promptIdea, 1000);
  const debouncedDialogue = useDebounce(dialogue, 1000);
  const debouncedSoundEffects = useDebounce(soundEffects, 1000);

  // Handle debounced updates
  useEffect(() => {
    if (debouncedShotType !== shot.shot_type && debouncedShotType !== null) {
      handleFieldUpdate({ shot_type: debouncedShotType });
    }
  }, [debouncedShotType]);

  useEffect(() => {
    if (debouncedPromptIdea !== shot.prompt_idea) {
      handleFieldUpdate({ prompt_idea: debouncedPromptIdea });
    }
  }, [debouncedPromptIdea]);

  useEffect(() => {
    if (debouncedDialogue !== shot.dialogue) {
      handleFieldUpdate({ dialogue: debouncedDialogue });
    }
  }, [debouncedDialogue]);

  useEffect(() => {
    if (debouncedSoundEffects !== shot.sound_effects) {
      handleFieldUpdate({ sound_effects: debouncedSoundEffects });
    }
  }, [debouncedSoundEffects]);

  // Helper to update shot fields
  const handleFieldUpdate = async (updates: Partial<ShotDetails>) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      await onUpdate(updates);
    } catch (error) {
      console.error('Error updating shot:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Shot type change handler (with immediate update)
  const handleShotTypeChange = (value: string) => {
    setShotType(value);
    handleFieldUpdate({ shot_type: value });
  };

  return {
    // State
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    isDeleting,
    isSaving,
    isGeneratingPrompt,
    isGeneratingImage,
    isGeneratingRef,
    
    // Setters
    setShotType,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageStatus,
    setIsDeleting,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    
    // Handlers
    handleShotTypeChange
  };
};


import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ShotDetails, ImageStatus } from '@/types/storyboardTypes';
import { toast } from 'sonner';

// Create a debounce function to prevent too many DB updates
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

export const useShotCardState = (
  shot: ShotDetails, 
  onUpdate: (updates: Partial<ShotDetails>) => Promise<void>
) => {
  // Local state for form fields
  const [shotType, setShotType] = useState(shot.shot_type || '');
  const [promptIdea, setPromptIdea] = useState(shot.prompt_idea || '');
  const [dialogue, setDialogue] = useState(shot.dialogue || '');
  const [soundEffects, setSoundEffects] = useState(shot.sound_effects || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for AI generation features
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(shot.image_status === 'generating');
  const [localVisualPrompt, setLocalVisualPrompt] = useState(shot.visual_prompt || '');
  const [localImageUrl, setLocalImageUrl] = useState(shot.image_url || null);
  const [localImageStatus, setLocalImageStatus] = useState<ImageStatus>(shot.image_status || 'pending');
  
  // Ref to prevent unnecessary updates from realtime
  const isGeneratingRef = useRef(false);

  // Track the last saved values to avoid unnecessary updates
  const lastSavedRef = useRef({
    shotType: shot.shot_type,
    promptIdea: shot.prompt_idea,
    dialogue: shot.dialogue,
    soundEffects: shot.sound_effects,
    visualPrompt: shot.visual_prompt
  });

  // Debounced values
  const debouncedPrompt = useDebounce(promptIdea, 750);
  const debouncedDialogue = useDebounce(dialogue, 750);
  const debouncedSoundEffects = useDebounce(soundEffects, 750);
  const debouncedVisualPrompt = useDebounce(localVisualPrompt, 750);

  // Effect to update local state when props change (e.g., initial load)
  useEffect(() => {
    setLocalVisualPrompt(shot.visual_prompt || '');
    setLocalImageUrl(shot.image_url || null);
    setLocalImageStatus(shot.image_status || 'pending');
    setIsGeneratingImage(shot.image_status === 'generating');
  }, [shot.id, shot.visual_prompt, shot.image_url, shot.image_status]); // Depend on shot.id to reset for new shots

  // Update fields when shot prop changes
  useEffect(() => {
    setShotType(shot.shot_type || '');
    setPromptIdea(shot.prompt_idea || '');
    setDialogue(shot.dialogue || '');
    setSoundEffects(shot.sound_effects || '');
    
    lastSavedRef.current = {
      shotType: shot.shot_type,
      promptIdea: shot.prompt_idea,
      dialogue: shot.dialogue,
      soundEffects: shot.sound_effects,
      visualPrompt: shot.visual_prompt
    };
  }, [shot.id]); // Only update if shot ID changes (new shot)

  // Subscribe to Realtime updates for this specific shot
  useEffect(() => {
    if (!shot.id) return;

    const channel = supabase
      .channel(`shot-${shot.id}-updates`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shots', filter: `id=eq.${shot.id}` },
        (payload) => {
          console.log(`Realtime update for shot ${shot.id}:`, payload.new);
          const updatedShot = payload.new as ShotDetails;
          // Only update if we aren't actively generating on the client side
          if (!isGeneratingRef.current) {
            setLocalVisualPrompt(updatedShot.visual_prompt || '');
            setLocalImageUrl(updatedShot.image_url || null);
            setLocalImageStatus(updatedShot.image_status || 'pending');
            setIsGeneratingImage(updatedShot.image_status === 'generating');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [shot.id]);

  // Effect for debounced updates
  useEffect(() => {
    const updateIfChanged = async () => {
      const updates: Partial<ShotDetails> = {};
      let hasChanges = false;

      if (debouncedPrompt !== lastSavedRef.current.promptIdea) {
        updates.prompt_idea = debouncedPrompt;
        hasChanges = true;
      }
      
      if (debouncedDialogue !== lastSavedRef.current.dialogue) {
        updates.dialogue = debouncedDialogue;
        hasChanges = true;
      }
      
      if (debouncedSoundEffects !== lastSavedRef.current.soundEffects) {
        updates.sound_effects = debouncedSoundEffects;
        hasChanges = true;
      }
      
      if (debouncedVisualPrompt !== lastSavedRef.current.visualPrompt) {
        updates.visual_prompt = debouncedVisualPrompt;
        hasChanges = true;
      }

      if (hasChanges) {
        setIsSaving(true);
        try {
          await onUpdate(updates);
          lastSavedRef.current = {
            ...lastSavedRef.current,
            promptIdea: debouncedPrompt,
            dialogue: debouncedDialogue,
            soundEffects: debouncedSoundEffects,
            visualPrompt: debouncedVisualPrompt
          };
        } finally {
          setIsSaving(false);
        }
      }
    };

    updateIfChanged();
  }, [debouncedPrompt, debouncedDialogue, debouncedSoundEffects, debouncedVisualPrompt, onUpdate]);

  const handleShotTypeChange = async (value: string) => {
    if (value !== lastSavedRef.current.shotType) {
      setShotType(value);
      setIsSaving(true);
      try {
        await onUpdate({ shot_type: value });
        lastSavedRef.current.shotType = value;
      } finally {
        setIsSaving(false);
      }
    }
  };

  return {
    // Form state
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    
    // UI state
    isDeleting,
    setIsDeleting,
    isSaving,
    isGeneratingPrompt,
    setIsGeneratingPrompt,
    isGeneratingImage,
    setIsGeneratingImage,
    isGeneratingRef,
    
    // Actions
    setShotType,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageUrl,
    setLocalImageStatus,
    handleShotTypeChange,
  };
};

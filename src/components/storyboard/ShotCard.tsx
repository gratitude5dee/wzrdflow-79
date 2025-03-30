import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit, Copy, Image, Play, RefreshCw, MoreHorizontal, Trash2, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { ShotDetails, ImageStatus } from '@/types/storyboardTypes';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ShotCardProps {
  shot: ShotDetails;
  onUpdate: (updates: Partial<ShotDetails>) => Promise<void>;
  onDelete: () => Promise<void>;
}

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

const ShotCard = ({ shot, onUpdate, onDelete }: ShotCardProps) => {
  // Local state for form fields
  const [shotType, setShotType] = useState(shot.shot_type || '');
  const [promptIdea, setPromptIdea] = useState(shot.prompt_idea || '');
  const [dialogue, setDialogue] = useState(shot.dialogue || '');
  const [soundEffects, setSoundEffects] = useState(shot.sound_effects || '');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // New state for AI generation features
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
  }, [debouncedPrompt, debouncedDialogue, debouncedSoundEffects, debouncedVisualPrompt]);

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

  const handleGenerateVisualPrompt = async () => {
    if (!shot.id) {
      toast.error("Cannot generate prompt: Shot ID is missing.");
      return;
    }
    setIsGeneratingPrompt(true);
    isGeneratingRef.current = true;
    try {
      const { data, error } = await supabase.functions.invoke('generate-visual-prompt', {
        body: { shot_id: shot.id }
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
    if (!shot.id) {
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
        body: { shot_id: shot.id }
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
        .eq('id', shot.id)
        .single();
        
      if (currentState) {
        // Make sure we handle the type correctly
        const updatedStatus: ImageStatus = (currentState.image_status || 'failed') as ImageStatus;
        setLocalImageStatus(updatedStatus);
        setLocalImageUrl(currentState.image_url || null);
        setIsGeneratingImage(updatedStatus === 'generating');
      }
    }
  };

  const handleDeleteShot = async () => {
    if (window.confirm('Are you sure you want to delete this shot?')) {
      setIsDeleting(true);
      try {
        await onDelete();
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: shot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const getImageStatusDisplay = () => {
    switch (localImageStatus) {
      case 'generating':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Generating image...</p>
              <p className="text-xs text-zinc-400">(This can take a minute)</p>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 backdrop-blur-sm">
            <div className="text-center p-2">
              <AlertCircle className="w-6 h-6 text-red-300 mx-auto mb-1" />
              <p className="text-sm text-white font-medium mb-2">Generation failed</p>
              <Button
                size="sm"
                variant="destructive"
                className="bg-red-700/80 hover:bg-red-600 text-xs h-7 px-2"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || isGeneratingPrompt}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        );
      case 'completed':
        return null; // Image is shown
      case 'pending':
      default:
        return (
          !localImageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1219]">
              <Image className="w-8 h-8 text-gray-700 opacity-50" />
            </div>
          )
        );
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-72 cursor-grab active:cursor-grabbing perspective group/shotcard"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Card className="bg-[#0A0D16] border border-[#1D2130] rounded-lg overflow-hidden shadow-xl card-3d relative">
        {/* Saving Indicator */}
        {isSaving && (
          <div className="absolute top-1 right-1 z-20">
            <div className="text-[10px] bg-blue-900/80 px-1.5 py-0.5 rounded-full text-blue-300 flex items-center backdrop-blur-sm">
              <Loader2 className="w-2 h-2 animate-spin mr-1" />
              Saving...
            </div>
          </div>
        )}

        <div className="aspect-video bg-[#0F1219] relative flex items-center justify-center group/image">
          {/* Shot Number */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white backdrop-blur-sm">
              #{shot.shot_number}
            </span>
          </div>
          
          {/* Image */}
          {localImageUrl && localImageStatus === 'completed' ? (
            <img
              src={localImageUrl}
              alt={`Shot ${shot.shot_number}`}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
          ) : null}
          
          {/* Status Overlay */}
          {getImageStatusDisplay()}
          
          {/* Action Buttons Overlay - Shown on hover, but not during generation/failure */}
          {localImageStatus !== 'generating' && localImageStatus !== 'failed' && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent flex items-end justify-center p-2 opacity-0 group-hover/shotcard:opacity-100 transition-opacity duration-300 z-10">
              <div className="flex gap-1 bg-black/50 backdrop-blur-sm p-1 rounded-lg">
                {/* Generate/Regenerate Prompt Button */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md bg-white/10 hover:bg-white/20 p-1.5 h-auto w-auto glow-icon-button"
                        onClick={handleGenerateVisualPrompt}
                        disabled={isGeneratingPrompt || isGeneratingImage}
                      >
                        {isGeneratingPrompt ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Wand2 className="w-4 h-4 text-white" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{localVisualPrompt ? 'Regenerate Visual Prompt' : 'Generate Visual Prompt'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Generate/Regenerate Image Button */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md bg-white/10 hover:bg-white/20 p-1.5 h-auto w-auto glow-icon-button"
                        onClick={handleGenerateImage}
                        disabled={!localVisualPrompt || isGeneratingImage || isGeneratingPrompt}
                      >
                        {isGeneratingImage ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <RefreshCw className="w-4 h-4 text-white" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{localImageUrl ? 'Regenerate Image' : 'Generate Image'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {/* Delete Button */}
                <TooltipProvider delayDuration={100}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-md bg-red-500/20 hover:bg-red-500/40 p-1.5 h-auto w-auto"
                        onClick={(e) => { e.stopPropagation(); handleDeleteShot(); }}
                        disabled={isDeleting}
                      >
                        {isDeleting ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Trash2 className="w-4 h-4 text-red-400" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom"><p>Delete shot</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}
        </div>
        
        {/* Card Content (Inputs) */}
        <div className="p-4 space-y-3 card-content">
          {/* Visual Prompt Display */}
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium flex items-center justify-between">
              Visual Prompt
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button onClick={handleGenerateVisualPrompt} disabled={isGeneratingPrompt || isGeneratingImage} className="text-purple-400 hover:text-purple-300 disabled:opacity-50">
                      <Wand2 className="w-3 h-3"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top"><p>Generate/Regenerate</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </p>
            <Textarea
              placeholder="AI generated visual prompt appears here..."
              className="bg-[#141824] border-[#2D3343] text-white min-h-[40px] rounded-md text-xs resize-none leading-snug"
              value={localVisualPrompt}
              onChange={(e) => setLocalVisualPrompt(e.target.value)}
              readOnly={isGeneratingPrompt}
            />
          </div>
          
          {/* Shot Type */}
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Shot Type</p>
            <Select value={shotType} onValueChange={handleShotTypeChange}>
              <SelectTrigger className="bg-[#141824] border-[#2D3343] text-white h-8 text-xs">
                <SelectValue placeholder="Select shot type" />
              </SelectTrigger>
              <SelectContent className="bg-[#141824] border-[#2D3343] text-white">
                <SelectItem value="wide">Wide Shot</SelectItem>
                <SelectItem value="medium">Medium Shot</SelectItem>
                <SelectItem value="close">Close-up</SelectItem>
                <SelectItem value="extreme_close_up">Extreme Close-up</SelectItem>
                <SelectItem value="establishing">Establishing Shot</SelectItem>
                <SelectItem value="pov">POV Shot</SelectItem>
                <SelectItem value="over_the_shoulder">Over-the-Shoulder</SelectItem>
                <SelectItem value="dutch_angle">Dutch Angle</SelectItem>
                <SelectItem value="low_angle">Low Angle</SelectItem>
                <SelectItem value="high_angle">High Angle</SelectItem>
                <SelectItem value="aerial">Aerial/Drone</SelectItem>
                <SelectItem value="tracking">Tracking Shot</SelectItem>
                <SelectItem value="insert">Insert Shot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Prompt Idea */}
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Description / Idea</p>
            <Textarea 
              placeholder="Describe the shot's content or purpose..." 
              className="bg-[#141824] border-[#2D3343] text-white min-h-[50px] rounded-md text-xs resize-none leading-snug"
              value={promptIdea}
              onChange={(e) => setPromptIdea(e.target.value)}
            />
          </div>
          
          {/* Dialogue */}
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Dialogue</p>
            <Input 
              placeholder="Character dialogue..." 
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-xs"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
            />
          </div>
          
          {/* Sound Effects */}
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Sound Effects</p>
            <Input 
              placeholder='E.g., "Footsteps on gravel..."' 
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-xs"
              value={soundEffects}
              onChange={(e) => setSoundEffects(e.target.value)}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ShotCard;

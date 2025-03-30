
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
import { Edit, Copy, Image, Play, RefreshCw, MoreHorizontal, Trash2, Loader2 } from 'lucide-react';
import { ShotDetails } from '@/types/storyboardTypes';

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

  // Track the last saved values to avoid unnecessary updates
  const lastSavedRef = useRef({
    shotType: shot.shot_type,
    promptIdea: shot.prompt_idea,
    dialogue: shot.dialogue,
    soundEffects: shot.sound_effects
  });

  // Debounced values
  const debouncedPrompt = useDebounce(promptIdea, 750);
  const debouncedDialogue = useDebounce(dialogue, 750);
  const debouncedSoundEffects = useDebounce(soundEffects, 750);

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
      soundEffects: shot.sound_effects
    };
  }, [shot.id]); // Only update if shot ID changes (new shot)

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

      if (hasChanges) {
        setIsSaving(true);
        try {
          await onUpdate(updates);
          lastSavedRef.current = {
            ...lastSavedRef.current,
            promptIdea: debouncedPrompt,
            dialogue: debouncedDialogue,
            soundEffects: debouncedSoundEffects
          };
        } finally {
          setIsSaving(false);
        }
      }
    };

    updateIfChanged();
  }, [debouncedPrompt, debouncedDialogue, debouncedSoundEffects]);

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
    switch (shot.image_status) {
      case 'generating':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-white">Generating image...</p>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <p className="text-sm text-red-400 mb-2">Image generation failed</p>
              <Button size="sm" variant="outline" className="border-red-800 bg-red-900/50 text-red-300">
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </Button>
            </div>
          </div>
        );
      default:
        return null;
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
      className="w-72 cursor-grab active:cursor-grabbing perspective"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Card className="bg-[#0A0D16] border border-[#1D2130] rounded-lg overflow-hidden shadow-xl card-3d">
        <div className="aspect-video bg-[#0F1219] relative flex items-center justify-center group">
          <div className="absolute top-2 left-2">
            <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white">
              #{shot.shot_number}
            </span>
          </div>
          
          {/* Image or placeholder */}
          {shot.image_url ? (
            <img 
              src={shot.image_url} 
              alt={`Shot ${shot.shot_number}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0F1219]">
              <Image className="w-8 h-8 text-gray-700 opacity-50" />
            </div>
          )}
          
          {/* Status overlay for generating/failed */}
          {getImageStatusDisplay()}
          
          {/* Action buttons overlay */}
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                    >
                      <Edit className="w-4 h-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit shot details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                    >
                      <Copy className="w-4 h-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Duplicate shot</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                    >
                      <RefreshCw className="w-4 h-4 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate new image</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-full bg-red-500/20 hover:bg-red-500/40 p-2 h-auto w-auto"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteShot(); 
                      }}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-red-400" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete shot</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* Saving indicator */}
          {isSaving && (
            <div className="absolute bottom-2 right-2">
              <div className="text-xs bg-black/60 px-2 py-1 rounded-full text-blue-300 flex items-center">
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                Saving...
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-3 card-content">
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-2 font-medium">Shot Type</p>
            <Select value={shotType} onValueChange={handleShotTypeChange}>
              <SelectTrigger className="bg-[#141824] border-[#2D3343] text-white h-8 text-sm">
                <SelectValue placeholder="Select shot type" />
              </SelectTrigger>
              <SelectContent className="bg-[#141824] border-[#2D3343] text-white">
                <SelectItem value="wide">Wide Shot</SelectItem>
                <SelectItem value="medium">Medium Shot</SelectItem>
                <SelectItem value="close">Close-up</SelectItem>
                <SelectItem value="extreme">Extreme Close-up</SelectItem>
                <SelectItem value="aerial">Aerial/Drone Shot</SelectItem>
                <SelectItem value="pov">POV Shot</SelectItem>
                <SelectItem value="tracking">Tracking Shot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-2 font-medium">Prompt</p>
            <Textarea 
              placeholder="Describe your shot..." 
              className="bg-[#141824] border-[#2D3343] text-white min-h-[60px] rounded-md text-sm resize-none"
              value={promptIdea}
              onChange={(e) => setPromptIdea(e.target.value)}
            />
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-2 font-medium">Character Dialogue</p>
            <Input 
              placeholder="Add character dialogue..." 
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-sm"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
            />
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-2 font-medium">Sound Effects</p>
            <Input 
              placeholder='E.g., "Ocean waves..."' 
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-sm"
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

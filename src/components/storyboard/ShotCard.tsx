
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Copy, Image, Play, RefreshCw, MoreHorizontal, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';

interface ShotCardProps {
  id: string;
  shot: ShotDetails;
}

const ShotCard = ({ id, shot }: ShotCardProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prompt, setPrompt] = useState(shot.prompt_idea || '');
  const [dialogue, setDialogue] = useState(shot.dialogue || '');
  const [soundEffects, setSoundEffects] = useState(shot.sound_effects || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1
  };

  const handleShotTypeChange = async (value: string) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('shots')
        .update({ shot_type: value })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error updating shot type:`, error);
      toast.error('Failed to update shot type.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePromptUpdate = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('shots')
        .update({ prompt_idea: prompt })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error updating prompt:`, error);
      toast.error('Failed to update shot prompt.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDialogueUpdate = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('shots')
        .update({ dialogue: dialogue })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error updating dialogue:`, error);
      toast.error('Failed to update dialogue.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSoundEffectsUpdate = async () => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('shots')
        .update({ sound_effects: soundEffects })
        .eq('id', id);
        
      if (error) throw error;
    } catch (error: any) {
      console.error(`Error updating sound effects:`, error);
      toast.error('Failed to update sound effects.');
    } finally {
      setIsUpdating(false);
    }
  };

  const regenerateImage = async () => {
    try {
      toast.info("Regenerating image...");
      
      const { error } = await supabase.functions.invoke('generate-shot-image', {
        body: { shot_id: id }
      });
      
      if (error) throw error;
      
      toast.success("Image regeneration started.");
    } catch (error: any) {
      console.error(`Error regenerating image:`, error);
      toast.error(`Failed to regenerate image: ${error.message}`);
    }
  };

  const renderImageArea = () => {
    if (shot.image_status === 'generating' || shot.image_status === 'pending') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white">
          <Loader2 className="w-6 h-6 animate-spin mb-2" />
          <span className="text-xs">{shot.image_status === 'generating' ? 'Generating image...' : 'Waiting to generate...'}</span>
        </div>
      );
    } else if (shot.image_status === 'failed') {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white p-2 text-center">
          <AlertTriangle className="w-6 h-6 mb-2" />
          <span className="text-xs">Image generation failed</span>
          <Button 
            onClick={regenerateImage} 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-black/30 text-white border-white/30 hover:bg-black/50 hover:text-white text-xs h-7"
          >
            Try Again
          </Button>
        </div>
      );
    } else if (shot.image_url) {
      return (
        <img 
          src={shot.image_url} 
          alt={`Shot ${shot.shot_number}`} 
          className="w-full h-full object-cover" 
        />
      );
    } else {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 text-white">
          <Image className="w-8 h-8 opacity-50" />
          <span className="text-xs mt-1 opacity-70">No image</span>
          <Button 
            onClick={regenerateImage} 
            variant="outline" 
            size="sm" 
            className="mt-2 bg-black/30 text-white border-white/30 hover:bg-black/50 hover:text-white text-xs h-7"
          >
            Generate
          </Button>
        </div>
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
      className="w-72 cursor-grab active:cursor-grabbing perspective flex-shrink-0"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <Card className="bg-[#0A0D16] border border-[#1D2130] rounded-lg overflow-hidden shadow-xl card-3d h-full flex flex-col">
        {/* Image Area */}
        <div className="aspect-video bg-[#0F1219] relative flex items-center justify-center group overflow-hidden">
          {renderImageArea()}
          {/* Shot Number Badge */}
          <div className="absolute top-2 left-2 z-10">
            <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white">
              #{shot.shot_number}
            </span>
          </div>
          
          {/* Hover Actions (only if not generating/failed) */}
          {shot.image_status !== 'generating' && shot.image_status !== 'pending' && shot.image_status !== 'failed' && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                >
                  <Edit className="w-4 h-4 text-white" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                >
                  <Copy className="w-4 h-4 text-white" />
                </Button>
                <Button 
                  onClick={regenerateImage}
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                >
                  <RefreshCw className="w-4 h-4 text-white" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-full bg-white/10 hover:bg-white/20 p-2 h-auto w-auto glow-icon-button"
                >
                  <Play className="w-4 h-4 text-white" />
                </Button>
              </div>
            </div>
          )}
          
          {/* More Options Button */}
          <div className="absolute top-2 right-2 z-10">
            <button className="text-white/70 hover:text-white p-1 bg-black/30 rounded-full">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-4 space-y-3 card-content flex-grow">
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Shot Type</p>
            <Select 
              defaultValue={shot.shot_type || undefined}
              onValueChange={handleShotTypeChange}
              disabled={isUpdating}
            >
              <SelectTrigger className="bg-[#141824] border-[#2D3343] text-white h-8 text-sm">
                <SelectValue placeholder="Select shot type" />
              </SelectTrigger>
              <SelectContent className="bg-[#141824] border-[#2D3343] text-white">
                <SelectItem value="Establishing Shot">Establishing Shot</SelectItem>
                <SelectItem value="Wide Shot">Wide Shot</SelectItem>
                <SelectItem value="Medium Shot">Medium Shot</SelectItem>
                <SelectItem value="Medium Close Up">Medium Close Up</SelectItem>
                <SelectItem value="Close Up">Close Up</SelectItem>
                <SelectItem value="Extreme Close Up">Extreme Close Up</SelectItem>
                <SelectItem value="Over the Shoulder">Over the Shoulder</SelectItem>
                <SelectItem value="POV Shot">POV Shot</SelectItem>
                <SelectItem value="Tracking Shot">Tracking Shot</SelectItem>
                <SelectItem value="Insert Shot">Insert Shot</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Prompt</p>
            <Textarea 
              placeholder="Describe your shot..."
              className="bg-[#141824] border-[#2D3343] text-white min-h-[60px] rounded-md text-sm resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handlePromptUpdate}
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Character Dialogue</p>
            <Input 
              placeholder="Add character dialogue..."
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-sm"
              value={dialogue}
              onChange={(e) => setDialogue(e.target.value)}
              onBlur={handleDialogueUpdate}
              disabled={isUpdating}
            />
          </div>
          
          <div>
            <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Sound Effects</p>
            <Input 
              placeholder='E.g., "Ocean waves..."'
              className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-sm"
              value={soundEffects}
              onChange={(e) => setSoundEffects(e.target.value)}
              onBlur={handleSoundEffectsUpdate}
              disabled={isUpdating}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ShotCard;

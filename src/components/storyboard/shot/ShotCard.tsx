
import React from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useShotCardState } from './useShotCardState';
import ShotForm from './ShotForm';
import ShotImage from './ShotImage';
import { ShotDetails, ImageStatus } from '@/types/storyboardTypes';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ShotCardProps {
  shot: ShotDetails;
  onDelete: () => void;
  onUpdate: (updates: Partial<ShotDetails>) => Promise<void>;
}

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

export const ShotCard = ({ shot, onDelete, onUpdate }: ShotCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: shot.id});
  
  const {
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    localAudioUrl,
    localAudioStatus,
    isDeleting,
    isSaving,
    isGeneratingPrompt,
    isGeneratingImage,
    isGeneratingAudio,
    isGeneratingRef,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageStatus,
    setLocalAudioUrl,
    setLocalAudioStatus,
    setIsDeleting,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setIsGeneratingAudio,
    handleShotTypeChange
  } = useShotCardState(shot, onUpdate);

  const deleteConfirmationId = `delete-confirmation-${shot.id}`;

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      key={shot.id}
      layoutId={shot.id}
      className="min-w-[300px] h-[400px] bg-[#161C2C] shadow-xl rounded-lg overflow-hidden border border-[#252E44] flex flex-col"
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex-1 h-[200px] flex items-center justify-center relative">
        <ShotImage
          shotNumber={shot.shot_number}
          imageUrl={localImageUrl}
          imageStatus={localImageStatus}
          isGenerating={isGeneratingImage}
          shotType={shotType || 'medium'}
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          <TooltipProvider>
            <Tooltip delayDuration={50}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-red-500/10 text-zinc-400 hover:text-red-400"
                  id={deleteConfirmationId}
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Delete shot</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-zinc-900 border-zinc-800">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This shot will be permanently deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setIsDeleting(true);
                    onDelete();
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <ShotForm
          id={shot.id}
          shotType={shotType}
          promptIdea={promptIdea}
          dialogue={dialogue}
          soundEffects={soundEffects}
          visualPrompt={localVisualPrompt}
          imageStatus={localImageStatus}
          audioUrl={localAudioUrl}
          audioStatus={localAudioStatus}
          isGeneratingPrompt={isGeneratingPrompt}
          isGeneratingImage={isGeneratingImage}
          isGeneratingAudio={isGeneratingAudio}
          isGeneratingRef={isGeneratingRef}
          onShotTypeChange={handleShotTypeChange}
          onPromptIdeaChange={(e) => setPromptIdea(e.target.value)}
          onDialogueChange={(e) => setDialogue(e.target.value)}
          onSoundEffectsChange={(e) => setSoundEffects(e.target.value)}
          setLocalVisualPrompt={setLocalVisualPrompt}
          setLocalImageStatus={setLocalImageStatus}
          setIsGeneratingPrompt={setIsGeneratingPrompt}
          setIsGeneratingImage={setIsGeneratingImage}
          setLocalAudioUrl={setLocalAudioUrl}
          setLocalAudioStatus={setLocalAudioStatus}
          setIsGeneratingAudio={setIsGeneratingAudio}
        />
      </div>
    </motion.div>
  );
};

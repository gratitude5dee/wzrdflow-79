
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ShotForm from './ShotForm';
import ShotImage from './ShotImage';
import ShotAudio from './ShotAudio';
import { ShotDetails } from '@/types/storyboardTypes';
import { useShotCardState } from './useShotCardState';
import { useAIGeneration } from './useAIGeneration';
import { useAudioGeneration } from './useAudioGeneration';
import { Button } from '@/components/ui/button';
import { Trash2, Move, Expand } from 'lucide-react';

interface ShotCardProps {
  shot: ShotDetails;
  onUpdate: (updates: Partial<ShotDetails>) => void;
  onDelete: () => void;
}

export const ShotCard: React.FC<ShotCardProps> = ({ shot, onUpdate, onDelete }) => {
  const {
    isEditing,
    isDeleting,
    isExpanded,
    isGeneratingRef,
    isGeneratingPrompt,
    isGeneratingImage,
    isGeneratingAudio,
    localVisualPrompt,
    localDialogue,
    localShotType,
    localPromptIdea,
    localImageStatus,
    setIsEditing,
    setIsDeleting,
    setIsExpanded,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setIsGeneratingAudio,
    setLocalVisualPrompt,
    setLocalDialogue,
    setLocalShotType,
    setLocalPromptIdea,
    setLocalImageStatus,
    handleSave,
    handleCancel,
    handleAddShotType,
    validateAndDelete
  } = useShotCardState({ shot, onUpdate, onDelete });

  const { handleGenerateVisualPrompt, handleGenerateImage } = useAIGeneration({
    shotId: shot.id,
    isGeneratingRef,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setLocalVisualPrompt,
    setLocalImageStatus,
    localVisualPrompt
  });

  const { handleGenerateAudio } = useAudioGeneration({
    shotId: shot.id,
    isGeneratingRef,
    setIsGeneratingAudio,
    dialogue: localDialogue || '',
  });

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: shot.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={style}
      ref={setNodeRef}
      className={cn(
        "relative flex flex-col bg-zinc-800/70 border border-zinc-700/50 rounded-lg overflow-hidden w-[230px] min-h-[300px]",
        isExpanded && "min-h-[400px] w-[320px]"
      )}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 cursor-move bg-black/30 hover:bg-black/50 p-1 rounded opacity-70 hover:opacity-100 transition-opacity"
      >
        <Move className="h-4 w-4 text-white" />
      </div>
      
      {/* Expand/Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-20 h-6 w-6 p-1 bg-black/30 hover:bg-black/50 opacity-70 hover:opacity-100 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Expand className="h-4 w-4 text-white" />
      </Button>
      
      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute bottom-2 right-2 z-20 h-6 w-6 p-1 bg-black/30 hover:bg-black/50 opacity-70 hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
        onClick={validateAndDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Shot number badge */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 bg-amber-800/80 text-amber-100 text-xs px-2 py-0.5 rounded-full">
        Shot {shot.shot_number}
      </div>

      {/* Image section */}
      <div className="flex-shrink-0">
        <ShotImage
          shotId={shot.id}
          imageUrl={shot.image_url}
          status={localImageStatus}
          isGenerating={isGeneratingPrompt || isGeneratingImage}
          hasVisualPrompt={!!localVisualPrompt}
          onGenerateImage={handleGenerateImage}
          onGenerateVisualPrompt={handleGenerateVisualPrompt}
        />
      </div>

      {/* Shot details */}
      <div className="flex-1 p-3 flex flex-col justify-between">
        {isEditing ? (
          <ShotForm
            shotType={localShotType}
            promptIdea={localPromptIdea}
            visualPrompt={localVisualPrompt}
            dialogue={localDialogue}
            onShotTypeChange={setLocalShotType}
            onPromptIdeaChange={setLocalPromptIdea}
            onVisualPromptChange={setLocalVisualPrompt}
            onDialogueChange={setLocalDialogue}
            onSave={handleSave}
            onCancel={handleCancel}
            isExpanded={isExpanded}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex-1 mb-2">
              {!localShotType ? (
                <button 
                  onClick={handleAddShotType}
                  className="text-xs text-zinc-400 hover:text-zinc-300 mb-1 hover:underline"
                >
                  + Add shot type
                </button>
              ) : (
                <div className="text-xs text-purple-300 mb-1">
                  {localShotType.replace(/_/g, ' ')}
                </div>
              )}
              
              <div className="text-xs text-zinc-400 line-clamp-3 mb-2">
                {localPromptIdea || "No description"}
              </div>
              
              {isExpanded && localVisualPrompt && (
                <div className="text-xs text-zinc-500 mt-1 border-t border-zinc-700/50 pt-1">
                  <span className="text-zinc-400 font-medium">Visual Prompt:</span>
                  <p className="line-clamp-4">{localVisualPrompt}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col mt-auto">
              {localDialogue && (
                <div className="text-xs text-zinc-400 border-t border-zinc-700/50 pt-1 mb-1">
                  <span className="text-zinc-300 font-medium">Dialogue:</span>
                  <p className="italic line-clamp-2">{localDialogue}</p>
                </div>
              )}
              
              <div className="flex justify-between mt-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-950/20 p-1 h-auto"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              </div>
              
              {/* Audio generation */}
              <ShotAudio
                audioUrl={shot.audio_url}
                status={shot.audio_status}
                isGenerating={isGeneratingAudio}
                hasDialogue={!!localDialogue}
                onGenerateAudio={handleGenerateAudio}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

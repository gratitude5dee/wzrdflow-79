
import React from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useShotCardState } from './useShotCardState';
import { useAIGeneration } from './useAIGeneration';
import ShotImage from './ShotImage';
import ShotForm from './ShotForm';
import { ShotCardProps } from './types';

const ShotCard: React.FC<ShotCardProps> = ({ shot, onUpdate, onDelete }) => {
  const {
    shotType,
    promptIdea,
    dialogue,
    soundEffects,
    localVisualPrompt,
    localImageUrl,
    localImageStatus,
    isDeleting,
    setIsDeleting,
    isSaving,
    isGeneratingPrompt,
    setIsGeneratingPrompt,
    isGeneratingImage,
    setIsGeneratingImage,
    isGeneratingRef,
    setShotType,
    setPromptIdea,
    setDialogue,
    setSoundEffects,
    setLocalVisualPrompt,
    setLocalImageStatus,
    handleShotTypeChange
  } = useShotCardState(shot, onUpdate);

  const { handleGenerateVisualPrompt, handleGenerateImage } = useAIGeneration({
    shotId: shot.id,
    isGeneratingRef,
    setIsGeneratingPrompt,
    setIsGeneratingImage,
    setLocalVisualPrompt,
    setLocalImageStatus,
    localVisualPrompt
  });

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

        {/* Image Section */}
        <ShotImage 
          shotNumber={shot.shot_number}
          imageUrl={localImageUrl}
          imageStatus={localImageStatus}
          isGeneratingImage={isGeneratingImage}
          isGeneratingPrompt={isGeneratingPrompt}
          isDeleting={isDeleting}
          hasVisualPrompt={Boolean(localVisualPrompt)}
          onGeneratePrompt={handleGenerateVisualPrompt}
          onGenerateImage={handleGenerateImage}
          onDelete={handleDeleteShot}
        />
        
        {/* Form Section */}
        <ShotForm 
          shotType={shotType}
          promptIdea={promptIdea}
          dialogue={dialogue}
          soundEffects={soundEffects}
          visualPrompt={localVisualPrompt}
          isGeneratingPrompt={isGeneratingPrompt}
          isGeneratingImage={isGeneratingImage}
          onShotTypeChange={handleShotTypeChange}
          onPromptIdeaChange={setPromptIdea}
          onDialogueChange={setDialogue}
          onSoundEffectsChange={setSoundEffects}
          onVisualPromptChange={setLocalVisualPrompt}
          onGeneratePrompt={handleGenerateVisualPrompt}
        />
      </Card>
    </motion.div>
  );
};

export default ShotCard;

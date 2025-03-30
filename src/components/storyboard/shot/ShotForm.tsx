
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ImagePlus, Loader2 } from 'lucide-react';
import { useAIGeneration } from './useAIGeneration';
import { useAudioGeneration } from './useAudioGeneration';
import ShotAudio from './ShotAudio';
import { ImageStatus, AudioStatus } from '@/types/storyboardTypes';

interface ShotFormProps {
  id?: string;
  shotType: string | null;
  promptIdea: string | null; 
  dialogue: string | null; 
  soundEffects?: string | null;
  visualPrompt?: string;
  imageStatus?: ImageStatus;
  audioUrl?: string | null;
  audioStatus?: AudioStatus;
  isGeneratingPrompt?: boolean;
  isGeneratingImage?: boolean;
  isGeneratingAudio?: boolean;
  isGeneratingRef?: React.MutableRefObject<boolean>;
  onShotTypeChange: (value: string) => void;
  onPromptIdeaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onDialogueChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSoundEffectsChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  setLocalVisualPrompt?: (prompt: string) => void;
  setLocalImageStatus?: (status: ImageStatus) => void;
  setIsGeneratingPrompt?: (isGenerating: boolean) => void;
  setIsGeneratingImage?: (isGenerating: boolean) => void;
  setLocalAudioUrl?: (url: string | null) => void;
  setLocalAudioStatus?: (status: AudioStatus) => void;
  setIsGeneratingAudio?: (isGenerating: boolean) => void;
  onSave?: () => void | Promise<void>; // Updated type to accept both void and Promise<void>
  onCancel?: () => void;
  isExpanded?: boolean;
}

const shotTypeOptions = [
  { value: 'wide', label: 'Wide Shot' },
  { value: 'medium', label: 'Medium Shot' },
  { value: 'close', label: 'Close-Up' },
  { value: 'extreme_close_up', label: 'Extreme Close-Up' },
  { value: 'establishing', label: 'Establishing Shot' },
  { value: 'pov', label: 'POV Shot' },
  { value: 'over_the_shoulder', label: 'Over-the-Shoulder' },
  { value: 'aerial', label: 'Aerial Shot' },
  { value: 'low_angle', label: 'Low Angle' },
  { value: 'high_angle', label: 'High Angle' },
  { value: 'dutch_angle', label: 'Dutch Angle' },
  { value: 'tracking', label: 'Tracking Shot' },
  { value: 'insert', label: 'Insert Shot' },
];

const ShotForm: React.FC<ShotFormProps> = ({
  id,
  shotType,
  promptIdea,
  dialogue,
  soundEffects,
  visualPrompt = '',
  imageStatus = 'pending',
  audioUrl = null,
  audioStatus = 'pending',
  isGeneratingPrompt = false,
  isGeneratingImage = false,
  isGeneratingAudio = false,
  isGeneratingRef,
  onShotTypeChange,
  onPromptIdeaChange,
  onDialogueChange,
  onSoundEffectsChange,
  setLocalVisualPrompt,
  setLocalImageStatus,
  setIsGeneratingPrompt,
  setIsGeneratingImage,
  setLocalAudioUrl,
  setLocalAudioStatus,
  setIsGeneratingAudio,
  onSave,
  onCancel,
  isExpanded
}) => {
  // Get AI generation functions if all the required props are provided
  const aiGenerationProps = id && setIsGeneratingPrompt && setIsGeneratingImage && 
    setLocalVisualPrompt && setLocalImageStatus && isGeneratingRef
    ? {
        shotId: id,
        isGeneratingRef,
        setIsGeneratingPrompt,
        setIsGeneratingImage,
        setLocalVisualPrompt,
        setLocalImageStatus,
        localVisualPrompt: visualPrompt
      }
    : null;
    
  const { handleGenerateVisualPrompt, handleGenerateImage } = aiGenerationProps
    ? useAIGeneration(aiGenerationProps)
    : { handleGenerateVisualPrompt: () => {}, handleGenerateImage: () => {} };

  // Get audio generation function if all the required props are provided
  const audioGenerationProps = id && setIsGeneratingAudio && setLocalAudioUrl && 
    setLocalAudioStatus && isGeneratingRef
    ? {
        shotId: id,
        isGeneratingRef,
        setIsGeneratingAudio,
        setLocalAudioUrl,
        setLocalAudioStatus
      }
    : null;
    
  const { handleGenerateAudio } = audioGenerationProps
    ? useAudioGeneration(audioGenerationProps)
    : { handleGenerateAudio: () => {} };

  // Create an async wrapper for the onSave function
  const handleSaveClick = async () => {
    if (onSave) {
      await onSave();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <Label htmlFor={`shot-type-${id}`} className="text-xs font-medium uppercase text-zinc-400 mb-1 block">
          Shot Type
        </Label>
        <Select value={shotType || 'medium'} onValueChange={onShotTypeChange}>
          <SelectTrigger id={`shot-type-${id}`} className="bg-[#141824] border-[#2D3343] text-white text-xs h-8">
            <SelectValue placeholder="Select shot type" />
          </SelectTrigger>
          <SelectContent className="bg-[#141824] border-[#2D3343] text-white">
            {shotTypeOptions.map(option => (
              <SelectItem key={option.value} value={option.value} className="text-xs">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor={`prompt-idea-${id}`} className="text-xs font-medium uppercase text-zinc-400 mb-1 block">
          Shot Description
        </Label>
        <Textarea
          id={`prompt-idea-${id}`}
          value={promptIdea || ''}
          onChange={onPromptIdeaChange}
          className="bg-[#141824] border-[#2D3343] text-white resize-none min-h-[80px] text-xs"
          placeholder="Describe what's happening in this shot..."
        />
      </div>

      <div>
        <Label htmlFor={`dialogue-${id}`} className="text-xs font-medium uppercase text-zinc-400 mb-1 block">
          Dialogue/Voiceover
        </Label>
        <Textarea
          id={`dialogue-${id}`}
          value={dialogue || ''}
          onChange={onDialogueChange}
          className="bg-[#141824] border-[#2D3343] text-white resize-none min-h-[60px] text-xs"
          placeholder="Any spoken dialogue in this shot..."
        />
        {id && setIsGeneratingAudio && setLocalAudioUrl && setLocalAudioStatus && isGeneratingRef && (
          <ShotAudio 
            audioUrl={audioUrl}
            status={audioStatus}
            isGenerating={isGeneratingAudio}
            hasDialogue={!!dialogue}
            onGenerateAudio={handleGenerateAudio}
          />
        )}
      </div>

      {onSoundEffectsChange && (
        <div>
          <Label htmlFor={`sound-effects-${id}`} className="text-xs font-medium uppercase text-zinc-400 mb-1 block">
            Sound Effects
          </Label>
          <Textarea
            id={`sound-effects-${id}`}
            value={soundEffects || ''}
            onChange={onSoundEffectsChange}
            className="bg-[#141824] border-[#2D3343] text-white resize-none min-h-[60px] text-xs"
            placeholder="Sound effects for this shot (e.g., footsteps, rain, door slam)..."
          />
        </div>
      )}

      {id && setIsGeneratingPrompt && setIsGeneratingImage && setLocalVisualPrompt && 
       setLocalImageStatus && isGeneratingRef && (
        <div>
          <Label htmlFor={`visual-prompt-${id}`} className="text-xs font-medium uppercase text-zinc-400 mb-1 flex justify-between">
            <span>Visual Prompt</span>
            {(imageStatus === 'pending' || imageStatus === 'failed') && (
              <button 
                onClick={handleGenerateVisualPrompt}
                className="text-blue-400 text-[10px] hover:text-blue-300 disabled:text-zinc-500"
                disabled={isGeneratingPrompt || isGeneratingImage || !promptIdea}
              >
                {isGeneratingPrompt ? 'Generating...' : 'Generate prompt'}
              </button>
            )}
          </Label>
          <Textarea
            id={`visual-prompt-${id}`}
            value={visualPrompt || ''}
            readOnly
            className="bg-[#141824] border-[#2D3343] text-white resize-none min-h-[80px] text-xs opacity-75"
            placeholder="Visual prompt will be generated..."
          />
          {visualPrompt && ['prompt_ready', 'failed'].includes(imageStatus) && (
            <Button
              variant="outline" 
              size="sm"
              className="mt-2 w-full text-purple-400 border-purple-500/30 hover:bg-purple-500/10"
              onClick={handleGenerateImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Image...
                </>
              ) : (
                <>
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {(onSave || onCancel) && (
        <div className="flex justify-end space-x-2 pt-2">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={onCancel}
              className="text-zinc-400 border-zinc-700 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          )}
          {onSave && (
            <Button 
              type="button" 
              variant="default" 
              size="sm" 
              onClick={handleSaveClick}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ShotForm;


import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Wand2 } from 'lucide-react';

interface ShotFormProps {
  shotType: string | null;
  promptIdea: string | null;
  dialogue: string | null;
  soundEffects: string | null;
  visualPrompt: string | null;
  isGeneratingPrompt: boolean;
  isGeneratingImage: boolean;
  onShotTypeChange: (value: string) => void;
  onPromptIdeaChange: (value: string | null) => void;
  onDialogueChange: (value: string | null) => void;
  onSoundEffectsChange: (value: string | null) => void;
  onVisualPromptChange: (value: string) => void;
  onGeneratePrompt: () => Promise<void>;
}

const ShotForm: React.FC<ShotFormProps> = ({
  shotType,
  promptIdea,
  dialogue,
  soundEffects,
  visualPrompt,
  isGeneratingPrompt,
  isGeneratingImage,
  onShotTypeChange,
  onPromptIdeaChange,
  onDialogueChange,
  onSoundEffectsChange,
  onVisualPromptChange,
  onGeneratePrompt
}) => {
  return (
    <div className="p-4 space-y-3 card-content">
      {/* Visual Prompt Display */}
      <div>
        <p className="text-xs text-zinc-500 uppercase mb-1 font-medium flex items-center justify-between">
          Visual Prompt
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={onGeneratePrompt} 
                  disabled={isGeneratingPrompt || isGeneratingImage} 
                  className="text-purple-400 hover:text-purple-300 disabled:opacity-50"
                >
                  <Wand2 className="w-3 h-3"/>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Generate/Regenerate</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <Textarea
          placeholder="AI generated visual prompt appears here..."
          className="bg-[#141824] border-[#2D3343] text-white min-h-[40px] rounded-md text-xs resize-none leading-snug"
          value={visualPrompt || ''}
          onChange={(e) => onVisualPromptChange(e.target.value)}
          readOnly={isGeneratingPrompt}
        />
      </div>

      {/* Shot Type */}
      <div>
        <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Shot Type</p>
        <Select value={shotType || undefined} onValueChange={onShotTypeChange}>
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
          value={promptIdea || ''}
          onChange={(e) => onPromptIdeaChange(e.target.value)}
        />
      </div>

      {/* Dialogue */}
      <div>
        <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Dialogue</p>
        <Input
          placeholder='Character dialogue...'
          className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-xs"
          value={dialogue || ''}
          onChange={(e) => onDialogueChange(e.target.value)}
        />
      </div>

      {/* Sound Effects */}
      <div>
        <p className="text-xs text-zinc-500 uppercase mb-1 font-medium">Sound Effects</p>
        <Input
          placeholder='E.g., "Footsteps on gravel..."'
          className="bg-[#141824] border-[#2D3343] text-white rounded-md h-8 text-xs"
          value={soundEffects || ''}
          onChange={(e) => onSoundEffectsChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default ShotForm;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCw, Loader2, AlertCircle, Image, Wand2, Trash2 } from 'lucide-react';
import { ImageStatus } from '@/types/storyboardTypes';

interface ShotImageProps {
  shotNumber: number;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  isGeneratingImage: boolean;
  isGeneratingPrompt: boolean;
  isDeleting: boolean;
  hasVisualPrompt: boolean;
  onGeneratePrompt: () => void;
  onGenerateImage: () => void;
  onDelete: () => void;
}

const ShotImage: React.FC<ShotImageProps> = ({
  shotNumber,
  imageUrl,
  imageStatus,
  isGeneratingImage,
  isGeneratingPrompt,
  isDeleting,
  hasVisualPrompt,
  onGeneratePrompt,
  onGenerateImage,
  onDelete
}) => {

  const getImageStatusDisplay = () => {
    switch (imageStatus) {
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
                onClick={onGenerateImage}
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
          !imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0F1219]">
              <Image className="w-8 h-8 text-gray-700 opacity-50" />
            </div>
          )
        );
    }
  };

  return (
    <div className="aspect-video bg-[#0F1219] relative flex items-center justify-center group/image">
      {/* Shot Number */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white backdrop-blur-sm">
          #{shotNumber}
        </span>
      </div>
      
      {/* Image */}
      {imageUrl && imageStatus === 'completed' ? (
        <img
          src={imageUrl}
          alt={`Shot ${shotNumber}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      ) : null}
      
      {/* Status Overlay */}
      {getImageStatusDisplay()}
      
      {/* Action Buttons Overlay - Shown on hover, but not during generation/failure */}
      {imageStatus !== 'generating' && imageStatus !== 'failed' && (
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
                    onClick={onGeneratePrompt}
                    disabled={isGeneratingPrompt || isGeneratingImage}
                  >
                    {isGeneratingPrompt ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Wand2 className="w-4 h-4 text-white" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{hasVisualPrompt ? 'Regenerate Visual Prompt' : 'Generate Visual Prompt'}</p>
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
                    onClick={onGenerateImage}
                    disabled={!hasVisualPrompt || isGeneratingImage || isGeneratingPrompt}
                  >
                    {isGeneratingImage ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <RefreshCw className="w-4 h-4 text-white" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>{imageUrl ? 'Regenerate Image' : 'Generate Image'}</p>
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
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
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
  );
};

export default ShotImage;

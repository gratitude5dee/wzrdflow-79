
import React from 'react';
import { Loader2, Wand2, Play } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ImageStatus } from '@/types/storyboardTypes';
import { supabase } from '@/integrations/supabase/client';

interface ShotImageProps {
  shotId: string;
  imageUrl: string | null;
  status: ImageStatus;
  isGenerating: boolean;
  hasVisualPrompt: boolean;
  onGenerateImage: () => void;
  onGenerateVisualPrompt: () => void;
}

const ShotImage: React.FC<ShotImageProps> = ({
  shotId,
  imageUrl,
  status,
  isGenerating,
  hasVisualPrompt,
  onGenerateImage,
  onGenerateVisualPrompt
}) => {
  const [isGeneratingVideo, setIsGeneratingVideo] = React.useState(false);

  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      toast.error('No image available to generate video from');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-from-image', {
        body: { shot_id: shotId, image_url: imageUrl }
      });

      if (error) {
        throw new Error(error.message || 'Failed to start video generation');
      }

      toast.success('Video generation started successfully');
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast.error(`Failed to generate video: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Loading or empty state
  if (!imageUrl) {
    return (
      <div className="w-full h-40 bg-zinc-900 flex flex-col items-center justify-center relative">
        {status === 'generating' || isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            <span className="text-xs text-zinc-400">Generating image...</span>
          </div>
        ) : status === 'failed' ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-xs text-red-400">Generation failed</span>
            {hasVisualPrompt ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs bg-zinc-800 hover:bg-zinc-700 mt-1"
                onClick={onGenerateImage}
              >
                Retry
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs bg-zinc-800 hover:bg-zinc-700 mt-1"
                onClick={onGenerateVisualPrompt}
              >
                Generate
              </Button>
            )}
          </div>
        ) : hasVisualPrompt ? (
          <div className="flex flex-col items-center justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-zinc-800/50 hover:bg-zinc-700 mt-1"
              onClick={onGenerateImage}
              disabled={isGenerating}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Generate Image
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs bg-zinc-800/50 hover:bg-zinc-700 mt-1"
              onClick={onGenerateVisualPrompt}
              disabled={isGenerating}
            >
              <Wand2 className="h-3 w-3 mr-1" />
              Generate Prompt
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Image with overlay options for video generation
  return (
    <div className="w-full aspect-video relative group">
      <img 
        src={imageUrl} 
        alt="Shot visualization" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <Button
          variant="outline"
          size="sm"
          className="text-xs bg-black/50 hover:bg-black/70 border-white/20 text-white"
          onClick={handleGenerateVideo}
          disabled={isGeneratingVideo}
        >
          {isGeneratingVideo ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Play className="h-3 w-3 mr-1 fill-current" />
          )}
          Generate Video
        </Button>
      </div>
    </div>
  );
};

export default ShotImage;


import React, { useState, useEffect } from 'react';
import { ImagePlus, Loader2, AlertCircle, RefreshCw, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageStatus } from '@/types/storyboardTypes';

interface ShotImageProps {
  shotId: string;
  imageUrl: string | null;
  status: ImageStatus;
  isGenerating: boolean;
  hasVisualPrompt: boolean;
  onGenerateImage: () => Promise<void>;
  onGenerateVisualPrompt: () => Promise<void>;
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
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoGenerationId, setVideoGenerationId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Handle generating video from the image
  const handleGenerateVideo = async () => {
    if (!imageUrl) {
      toast.error("No image available to generate video from");
      return;
    }

    try {
      setIsGeneratingVideo(true);
      
      // Call edge function to generate video
      const { data, error } = await supabase.functions.invoke('generate-video-from-image', {
        body: { shot_id: shotId, image_url: imageUrl }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate video');
      }
      
      if (data?.luma_generation_id) {
        setVideoGenerationId(data.luma_generation_id);
        toast.success('Video generation started!');
      } else {
        throw new Error('No generation ID returned');
      }
    } catch (error: any) {
      console.error('Error generating video:', error);
      toast.error(`Failed to generate video: ${error.message}`);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  // Check video generation status if we have an ID
  useEffect(() => {
    if (!videoGenerationId) return;

    const checkVideoStatus = async () => {
      try {
        const { data: generations, error } = await supabase
          .from('generations')
          .select('status, failure_reason, result_media_asset_id, media_assets:result_media_asset_id(cdn_url)')
          .eq('external_request_id', videoGenerationId)
          .eq('api_provider', 'luma_video')
          .single();

        if (error) throw error;

        if (generations) {
          if (generations.status === 'completed' && generations.media_assets?.cdn_url) {
            toast.success('Video generation completed!');
            setVideoUrl(generations.media_assets.cdn_url);
            setVideoGenerationId(null); // Stop checking
          } else if (generations.status === 'failed') {
            toast.error(`Video generation failed: ${generations.failure_reason || 'Unknown error'}`);
            setVideoGenerationId(null); // Stop checking
          }
        }
      } catch (err) {
        console.error('Error checking video status:', err);
      }
    };

    // Check immediately and then every 10 seconds
    checkVideoStatus();
    const interval = setInterval(checkVideoStatus, 10000);
    
    return () => clearInterval(interval);
  }, [videoGenerationId, supabase]);

  // If we have a video URL, show it
  if (videoUrl) {
    return (
      <div className="relative w-full h-full rounded-md overflow-hidden bg-black flex items-center justify-center">
        <video 
          className="object-contain max-w-full max-h-full"
          controls
          autoPlay
          loop
          src={videoUrl}
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white border-none"
          onClick={() => setVideoUrl(null)} // Go back to image view
        >
          Back to Image
        </Button>
      </div>
    );
  }

  // If no image is available, show placeholder with generate button
  if (!imageUrl) {
    return (
      <div 
        className="w-full h-40 bg-zinc-900/50 rounded-md flex flex-col items-center justify-center space-y-2 p-3"
      >
        {status === 'failed' ? (
          <>
            <AlertCircle className="h-8 w-8 text-red-500/70" />
            <p className="text-xs text-zinc-400 text-center">Generation failed</p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-zinc-400 h-8"
              disabled={isGenerating || !hasVisualPrompt}
              onClick={onGenerateImage}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </>
        ) : hasVisualPrompt ? (
          <>
            <Button
              variant="ghost"
              disabled={isGenerating}
              onClick={onGenerateImage}
              className="text-xs flex flex-col h-auto py-3 px-3"
            >
              {isGenerating ? (
                <Loader2 className="h-8 w-8 text-purple-500/70 mb-2 animate-spin" />
              ) : (
                <ImagePlus className="h-8 w-8 text-purple-500/70 mb-2" />
              )}
              {isGenerating ? 'Generating...' : 'Generate Image'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              disabled={isGenerating}
              onClick={onGenerateVisualPrompt}
              className="text-xs flex flex-col h-auto py-3 px-3"
            >
              {isGenerating ? (
                <Loader2 className="h-8 w-8 text-blue-500/70 mb-2 animate-spin" />
              ) : (
                <ImagePlus className="h-8 w-8 text-blue-500/70 mb-2" />
              )}
              {isGenerating ? 'Preparing...' : 'Generate Visual Prompt'}
            </Button>
          </>
        )}
      </div>
    );
  }

  // Show image with loading state while generating
  return (
    <div className="relative w-full rounded-md overflow-hidden bg-black aspect-video">
      <img 
        src={imageUrl} 
        alt="Shot visualization" 
        className={cn(
          "w-full h-full object-contain",
          isGenerating && "opacity-50"
        )}
      />
      
      {isGenerating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-white animate-spin" />
        </div>
      )}
      
      {!isGenerating && !isGeneratingVideo && (
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white border-none"
          onClick={handleGenerateVideo}
        >
          <Play className="h-3 w-3 mr-1" />
          Generate Video
        </Button>
      )}
      
      {isGeneratingVideo && (
        <div className="absolute bottom-2 right-2 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing Video...
        </div>
      )}
    </div>
  );
};

export default ShotImage;

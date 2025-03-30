
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Loader2, VolumeX, Volume2, Headphones } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ShotAudioProps {
  audioUrl: string | null;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  isGenerating: boolean;
  hasDialogue: boolean;
  onGenerateAudio: () => void;
}

const ShotAudio: React.FC<ShotAudioProps> = ({ 
  audioUrl, 
  status, 
  isGenerating, 
  hasDialogue,
  onGenerateAudio 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  if (status === 'failed') {
    return (
      <div className="flex items-center mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-400 border-red-400/30 hover:bg-red-400/10 hover:text-red-400 w-full" 
          onClick={onGenerateAudio}
        >
          <VolumeX className="h-4 w-4 mr-2" />
          Retry Audio
        </Button>
      </div>
    );
  }

  if (status === 'generating' || isGenerating) {
    return (
      <div className="flex items-center mt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-blue-400 border-blue-400/30 hover:bg-blue-400/10 hover:text-blue-400 w-full"
          disabled
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generating Audio...
        </Button>
      </div>
    );
  }

  if (status === 'completed' && audioUrl) {
    return (
      <div className="flex items-center space-x-2 mt-2">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={handleEnded} 
          className="hidden" 
        />
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "text-green-400 border-green-400/30 hover:bg-green-400/10 hover:text-green-400 flex-1",
            isPlaying && "bg-green-400/10"
          )}
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          {isPlaying ? "Pause" : "Play Audio"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-zinc-400 border-zinc-700 p-0 w-9 h-9"
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center mt-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-zinc-400 border-zinc-700 hover:bg-zinc-800 hover:text-zinc-300 w-full",
                !hasDialogue && "opacity-50"
              )}
              onClick={onGenerateAudio}
              disabled={!hasDialogue}
            >
              <Headphones className="h-4 w-4 mr-2" />
              Generate Audio
            </Button>
          </TooltipTrigger>
          {!hasDialogue && (
            <TooltipContent side="top">
              <p>Add dialogue to generate audio</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ShotAudio;

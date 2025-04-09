
import { useState } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { Upload, GitBranch, Video, MessageCircle, CircleDashed } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import HistoryPanel from '../HistoryPanel';

interface VideoBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

const VideoBlock = ({ id, onSelect, isSelected }: VideoBlockProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  // Mock history data
  const historyItems = [];

  // Example connection points
  const connectionPoints = [
    { id: 'video-out', type: 'output' as const, label: 'Video Output', position: 'right' as const },
    { id: 'prompt-in', type: 'input' as const, label: 'Prompt Input', position: 'left' as const },
    { id: 'image-in', type: 'input' as const, label: 'Image Input', position: 'left' as const },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setVideoUrl('https://placehold.co/600x400/333/white?text=Generated+Video');
    }, 2000);
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <BlockBase
      id={id}
      type="video"
      title="VIDEO"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~4m"
      supportsConnections={true}
      connectionPoints={connectionPoints}
      onShowHistory={handleShowHistory}
    >
      {showHistory ? (
        <HistoryPanel 
          items={historyItems}
          onSelectItem={(item) => {
            setPrompt(item.prompt);
            setShowHistory(false);
          }}
          blockType="video"
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Try to...</h4>
            <div className="grid grid-cols-1 gap-1">
              <IconButton icon={<Upload className="h-3.5 w-3.5" />} label="Upload a video" />
              <IconButton icon={<GitBranch className="h-3.5 w-3.5" />} label="Combine images into a video" />
              <IconButton icon={<Video className="h-3.5 w-3.5" />} label="Turn an image into a video" />
            </div>
          </div>

          {videoUrl ? (
            <div className="relative aspect-video bg-zinc-800 rounded overflow-hidden group">
              <video 
                src={videoUrl} 
                className="w-full h-full object-cover" 
                controls
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" size="sm">Regenerate</Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                placeholder='Try "A whimsical animated clip about dreams"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] bg-zinc-800/50 border-zinc-700 resize-none text-sm"
              />
              <Button 
                className="absolute bottom-2 right-2 bg-zinc-700 hover:bg-zinc-600 h-8 px-3"
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
              >
                {isGenerating ? (
                  <>
                    <CircleDashed className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </BlockBase>
  );
};

export default VideoBlock;

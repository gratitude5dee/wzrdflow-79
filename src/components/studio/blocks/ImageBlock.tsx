
import { useState, useRef } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { Upload, GitBranch, Video, MessageCircle, CircleDashed, PenTool } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import StyleSelector, { Style } from '../StyleSelector';
import HistoryPanel from '../HistoryPanel';
import { cn } from '@/lib/utils';

interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

// Mock styles
const STYLES: Style[] = [
  { id: 'fisheye', name: 'Fisheye' },
  { id: 'motion-blur', name: 'Motion Blur' },
  { id: 'monochrome', name: 'Monochrome' },
  { id: 'architectural', name: 'Architectural' },
  { id: 'soft-focus', name: 'Soft Focus' },
  { id: 'photorealistic', name: 'Photorealistic' },
  { id: 'line-drawing', name: 'Line Drawing' },
];

const ImageBlock = ({ id, onSelect, isSelected }: ImageBlockProps) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showStyleSelector, setShowStyleSelector] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  
  const styleSelectorRef = useRef<HTMLDivElement>(null);

  // Mock history data
  const historyItems = [];

  // Example connection points
  const connectionPoints = [
    { id: 'image-out', type: 'output' as const, label: 'Image Output', position: 'right' as const },
    { id: 'seed-out', type: 'output' as const, label: 'Seed Output', position: 'right' as const },
    { id: 'prompt-in', type: 'input' as const, label: 'Prompt Input', position: 'left' as const },
    { id: 'style-in', type: 'input' as const, label: 'Style Input', position: 'left' as const },
  ];

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setImageUrl('https://placehold.co/400x300');
    }, 2000);
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId || null);
    setShowStyleSelector(false);
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <BlockBase
      id={id}
      type="image"
      title="IMAGE"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~10s"
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
          blockType="image"
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Try to...</h4>
            <div className="grid grid-cols-1 gap-1">
              <IconButton icon={<Upload className="h-3.5 w-3.5" />} label="Upload an image" />
              <IconButton icon={<GitBranch className="h-3.5 w-3.5" />} label="Combine images into a video" />
              <IconButton icon={<Video className="h-3.5 w-3.5" />} label="Turn an image into a video" />
              <IconButton icon={<MessageCircle className="h-3.5 w-3.5" />} label="Ask a question about an image" />
            </div>
          </div>
          
          {imageUrl ? (
            <div className="relative group">
              <img src={imageUrl} alt="Generated" className="w-full rounded-md" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" size="sm">Regenerate</Button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <Textarea
                placeholder='Try "A close-up macro shot of dew on a spider web"'
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px] bg-zinc-800/50 border-zinc-700 resize-none text-sm"
              />
              <div className="absolute bottom-2 right-2 flex items-center gap-2">
                <Button 
                  className="bg-zinc-700 hover:bg-zinc-600 h-8 w-8 p-0"
                  onClick={() => setShowStyleSelector(!showStyleSelector)}
                  title="Select style"
                >
                  <PenTool className="h-4 w-4" />
                </Button>
                <Button 
                  className="bg-zinc-700 hover:bg-zinc-600 h-8 px-3"
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                >
                  {isGenerating ? (
                    <CircleDashed className="h-4 w-4 animate-spin" />
                  ) : (
                    "Generate"
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {selectedStyle && (
            <div className="flex items-center mt-2">
              <span className="text-xs text-zinc-500 mr-2">Style:</span>
              <span className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-300">
                {STYLES.find(s => s.id === selectedStyle)?.name || 'Custom'}
              </span>
            </div>
          )}
          
          <div 
            ref={styleSelectorRef} 
            className={cn(
              "absolute bottom-full left-0 mb-2 z-50 transition-opacity",
              showStyleSelector ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
          >
            {showStyleSelector && (
              <StyleSelector 
                styles={STYLES}
                selectedStyleId={selectedStyle || ''}
                onStyleSelect={handleStyleSelect}
              />
            )}
          </div>
        </div>
      )}
    </BlockBase>
  );
};

export default ImageBlock;

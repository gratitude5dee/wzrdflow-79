
import { useState } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { Upload, GitBranch, Video, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ImageBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

const ImageBlock = ({ id, onSelect, isSelected }: ImageBlockProps) => {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  return (
    <BlockBase
      id={id}
      type="image"
      title="IMAGE"
      onSelect={onSelect}
      isSelected={isSelected}
    >
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
            <Button 
              className="absolute bottom-2 right-2 bg-zinc-700 hover:bg-zinc-600 h-8 w-8 p-0"
              onClick={() => setImageUrl('https://placehold.co/400x300')}
            >
              <Video className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </BlockBase>
  );
};

export default ImageBlock;

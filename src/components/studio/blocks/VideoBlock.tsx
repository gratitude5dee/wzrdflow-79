
import { useState } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { Upload, GitBranch, Video } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface VideoBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

const VideoBlock = ({ id, onSelect, isSelected }: VideoBlockProps) => {
  const [prompt, setPrompt] = useState('');
  
  return (
    <BlockBase
      id={id}
      type="video"
      title="VIDEO"
      onSelect={onSelect}
      isSelected={isSelected}
    >
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-zinc-500 mb-2">Try to...</h4>
          <div className="grid grid-cols-1 gap-1">
            <IconButton icon={<Upload className="h-3.5 w-3.5" />} label="Upload a video" />
            <IconButton icon={<GitBranch className="h-3.5 w-3.5" />} label="Combine images into a video" />
            <IconButton icon={<Video className="h-3.5 w-3.5" />} label="Turn an image into a video" />
          </div>
        </div>
        
        <Textarea
          placeholder='Try "A whimsical animated clip about dreams"'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] bg-zinc-800/50 border-zinc-700 resize-none text-sm"
        />
      </div>
    </BlockBase>
  );
};

export default VideoBlock;

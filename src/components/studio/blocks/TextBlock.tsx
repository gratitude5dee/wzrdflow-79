
import { useState } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { File, GitBranch, FileEdit, MessageCircle, Video } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface TextBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

const TextBlock = ({ id, onSelect, isSelected }: TextBlockProps) => {
  const [text, setText] = useState('');
  
  return (
    <BlockBase
      id={id}
      type="text"
      title="TEXT"
      onSelect={onSelect}
      isSelected={isSelected}
    >
      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-medium text-zinc-500 mb-2">Try to...</h4>
          <div className="grid grid-cols-1 gap-1">
            <IconButton icon={<File className="h-3.5 w-3.5" />} label="Write or paste text" />
            <IconButton icon={<GitBranch className="h-3.5 w-3.5" />} label="Combine ideas" />
            <IconButton icon={<FileEdit className="h-3.5 w-3.5" />} label="Elaborate" />
            <IconButton icon={<MessageCircle className="h-3.5 w-3.5" />} label="Ask a question about an image" />
            <IconButton icon={<Video className="h-3.5 w-3.5" />} label="Turn text into a video" />
          </div>
        </div>
        
        <Textarea
          placeholder='Try "A mysterious diary entry from an anonymous writer"'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[80px] bg-zinc-800/50 border-zinc-700 resize-none text-sm"
        />
      </div>
    </BlockBase>
  );
};

export default TextBlock;

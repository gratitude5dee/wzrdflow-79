
import { useState } from 'react';
import BlockBase from './BlockBase';
import { IconButton } from '../StudioUtils';
import { FileText, GitBranch, MessageCircle, Video, CircleDashed } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import HistoryPanel from '../HistoryPanel';

interface TextBlockProps {
  id: string;
  onSelect: () => void;
  isSelected: boolean;
}

const TextBlock = ({ id, onSelect, isSelected }: TextBlockProps) => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Mock history data
  const historyItems = [];
  
  // Example connection points
  const connectionPoints = [
    { id: 'text-out', type: 'output' as const, label: 'Text Output', position: 'right' as const },
    { id: 'prompt-in', type: 'input' as const, label: 'Prompt Input', position: 'left' as const },
  ];
  
  const handleGenerate = () => {
    if (!content.trim()) return;
    setIsGenerating(true);
    
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
      setContent(content + '\n\n' + 'This is a sample generated text that would come from an AI model based on your input.');
    }, 1500);
  };
  
  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };
  
  return (
    <BlockBase
      id={id}
      type="text"
      title="TEXT"
      onSelect={onSelect}
      isSelected={isSelected}
      generationTime="~4s"
      supportsConnections={true}
      connectionPoints={connectionPoints}
      onShowHistory={handleShowHistory}
    >
      {showHistory ? (
        <HistoryPanel 
          items={historyItems}
          onSelectItem={(item) => {
            setContent(item.prompt);
            setShowHistory(false);
          }}
          blockType="text"
        />
      ) : (
        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-medium text-zinc-500 mb-2">Try to...</h4>
            <div className="grid grid-cols-1 gap-1">
              <IconButton icon={<FileText className="h-3.5 w-3.5" />} label="Write or paste text" />
              <IconButton icon={<GitBranch className="h-3.5 w-3.5" />} label="Combine ideas" />
              <IconButton icon={<MessageCircle className="h-3.5 w-3.5" />} label="Ask a question about an image" />
              <IconButton icon={<Video className="h-3.5 w-3.5" />} label="Turn text into a video" />
            </div>
          </div>
          
          <div className="relative">
            <Textarea
              placeholder='Try "A mysterious diary entry from an anonymous writer"'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] bg-zinc-800/50 border-zinc-700 resize-none text-sm"
            />
            {content && (
              <Button 
                className="absolute bottom-2 right-2 bg-zinc-700 hover:bg-zinc-600 h-8 px-3"
                onClick={handleGenerate}
                disabled={isGenerating || !content.trim()}
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
            )}
          </div>
        </div>
      )}
    </BlockBase>
  );
};

export default TextBlock;

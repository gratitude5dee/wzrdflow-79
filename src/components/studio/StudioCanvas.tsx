
import { useState } from 'react';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
}

interface StudioCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

type ViewMode = 'normal' | 'compact' | 'grid';

const StudioCanvas = ({ blocks, selectedBlockId, onSelectBlock }: StudioCanvasProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Function to get the column span based on view mode
  const getColSpan = (blockType: string, index: number): string => {
    if (viewMode === 'normal') {
      // In normal view, each block takes full width
      return 'col-span-3';
    } else if (viewMode === 'compact') {
      // In compact view, alternate between 2 and 1 columns
      return index % 3 === 0 ? 'col-span-2' : 'col-span-1';
    } else {
      // In grid view, blocks are arranged in a 3-column grid
      return 'col-span-1';
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only deselect if clicking directly on the canvas background
    if (e.target === e.currentTarget) {
      onSelectBlock('');
    }
  };

  return (
    <div 
      className="flex-1 bg-black overflow-auto p-6"
      style={{ 
        backgroundImage: 'radial-gradient(#333 1px, transparent 0)',
        backgroundSize: '24px 24px',
        backgroundPosition: '-12px -12px'
      }}
      onClick={handleCanvasClick}
    >
      <div 
        className={cn(
          "max-w-6xl mx-auto py-4 grid grid-cols-3 gap-6",
          viewMode === 'normal' && "grid-cols-1", 
          viewMode === 'compact' && "grid-cols-3",
          viewMode === 'grid' && "grid-cols-3"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.map((block, index) => {
          const colSpan = getColSpan(block.type, index);
          
          if (block.type === 'text') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <TextBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </motion.div>
            );
          } else if (block.type === 'image') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <ImageBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </motion.div>
            );
          } else if (block.type === 'video') {
            return (
              <motion.div
                key={block.id}
                className={colSpan}
                layout
                transition={{ duration: 0.3 }}
              >
                <VideoBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default StudioCanvas;

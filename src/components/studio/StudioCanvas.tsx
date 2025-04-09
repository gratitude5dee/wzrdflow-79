
import { useState } from 'react';
import TextBlock from './blocks/TextBlock';
import ImageBlock from './blocks/ImageBlock';
import VideoBlock from './blocks/VideoBlock';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
}

interface StudioCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
}

const StudioCanvas = ({ blocks, selectedBlockId, onSelectBlock }: StudioCanvasProps) => {
  return (
    <div 
      className="flex-1 bg-black overflow-auto p-6"
      style={{ 
        backgroundImage: 'radial-gradient(#333 1px, transparent 0)',
        backgroundSize: '24px 24px',
        backgroundPosition: '-12px -12px'
      }}
      onClick={() => onSelectBlock('')}
    >
      <div 
        className="max-w-6xl mx-auto py-4 grid grid-cols-3 gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        {blocks.map((block) => {
          if (block.type === 'text') {
            return (
              <div key={block.id} className="col-span-1">
                <TextBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </div>
            );
          } else if (block.type === 'image') {
            return (
              <div key={block.id} className="col-span-1">
                <ImageBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </div>
            );
          } else if (block.type === 'video') {
            return (
              <div key={block.id} className="col-span-1">
                <VideoBlock 
                  id={block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  isSelected={selectedBlockId === block.id}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default StudioCanvas;


import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import StudioHeader from '@/components/studio/StudioHeader';
import StudioSidebar from '@/components/studio/StudioSidebar';
import StudioCanvas from '@/components/studio/StudioCanvas';
import StudioBottomBar from '@/components/studio/StudioBottomBar';
import { StudioRightPanel } from '@/components/studio/StudioSidePanels';
import { useParams } from 'react-router-dom';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video';
}

const StudioPage = () => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [blocks, setBlocks] = useState<Block[]>([
    { id: uuidv4(), type: 'text' },
    { id: uuidv4(), type: 'image' },
    { id: uuidv4(), type: 'video' },
  ]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  const handleAddBlock = (type: 'text' | 'image' | 'video') => {
    const newBlock = { id: uuidv4(), type };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };
  
  const handleSelectBlock = (id: string) => {
    setSelectedBlockId(id || null);
  };
  
  // Get the type of the currently selected block
  const selectedBlockType = blocks.find(b => b.id === selectedBlockId)?.type || null;
  
  return (
    <div className="h-screen flex flex-col bg-black text-white">
      <StudioHeader viewMode="studio" />
      
      <div className="flex-1 flex overflow-hidden">
        <StudioSidebar onAddBlock={handleAddBlock} />
        
        <StudioCanvas 
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onSelectBlock={handleSelectBlock}
        />
        
        <StudioRightPanel selectedBlockType={selectedBlockType} />
      </div>
      
      <StudioBottomBar />
    </div>
  );
};

export default StudioPage;

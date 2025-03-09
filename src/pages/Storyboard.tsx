
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';
import StoryboardSidebar from '@/components/storyboard/StoryboardSidebar';
import ShotsRow from '@/components/storyboard/ShotsRow';

const StoryboardPage = () => {
  const [scenes, setScenes] = useState([1]); // Initial scene
  
  const addScene = () => {
    setScenes(prev => [...prev, prev.length + 1]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0F1117]">
      {/* Header */}
      <StoryboardHeader />
      
      {/* Main content with resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="h-full">
          <StoryboardSidebar />
        </ResizablePanel>
        
        {/* Main content area */}
        <ResizablePanel defaultSize={80}>
          <div className="p-6 h-full overflow-y-auto">
            {scenes.map(sceneNumber => (
              <ShotsRow key={sceneNumber} sceneNumber={sceneNumber} />
            ))}
            
            <Button 
              onClick={addScene}
              className="mt-8 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 justify-center shadow-lg z-10"
            >
              <Plus className="w-5 h-5" />
              <span className="sr-only">Add a scene</span>
            </Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Background gradient and noise texture */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0D14]/80 to-[#131A2A]/80 -z-10" />
      <div className="fixed inset-0 bg-noise opacity-5 -z-10" style={{ backgroundImage: 'url(/noise.png)' }} />
    </div>
  );
};

export default StoryboardPage;

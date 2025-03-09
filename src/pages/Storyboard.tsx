
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { motion } from 'framer-motion';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';
import StoryboardSidebar from '@/components/storyboard/StoryboardSidebar';
import ShotsRow from '@/components/storyboard/ShotsRow';

const StoryboardPage = () => {
  const [scenes, setScenes] = useState([1]); // Initial scene
  
  const addScene = () => {
    setScenes(prev => [...prev, prev.length + 1]);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
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
            
            <motion.button 
              onClick={addScene}
              className="mt-8 fixed bottom-6 right-6 rounded-full h-12 w-12 bg-black/30 backdrop-blur-lg border border-white/10 p-0 flex items-center justify-center shadow-glow-purple z-10"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Plus className="w-5 h-5 text-purple-400" />
              <span className="sr-only">Add a scene</span>
            </motion.button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Background gradient and noise texture */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0A0D16]/90 to-[#131A2A]/90 -z-10" />
      <div className="fixed inset-0 bg-noise opacity-5 -z-10" style={{ backgroundImage: 'url(/noise.png)' }} />
    </div>
  );
};

export default StoryboardPage;

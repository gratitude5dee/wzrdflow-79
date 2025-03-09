
import React, { useEffect, useRef } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import TimelinePanel from './TimelinePanel';
import MediaPanel from './MediaPanel';
import PreviewPanel from './PreviewPanel';
import ToolbarPanel from './ToolbarPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const VideoEditor = () => {
  const { 
    projectName, 
    isPlaying, 
    currentTime, 
    duration,
    togglePlayPause, 
    setCurrentTime, 
    setDuration,
    dialogs,
    openDialog,
    closeDialog
  } = useVideoEditor();

  // Reference to the video element for playback control
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Handle playback state changes
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-full bg-[#0A0D16] text-white">
      <ToolbarPanel />
      
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left panel - Media Library */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#111520] border-r border-[#1D2130]">
          <Tabs defaultValue="library" className="w-full">
            <TabsList className="w-full bg-[#0A0D16] border-b border-[#1D2130]">
              <TabsTrigger value="library" className="flex-1">Media Library</TabsTrigger>
              <TabsTrigger value="effects" className="flex-1">Effects</TabsTrigger>
            </TabsList>
            <TabsContent value="library" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <MediaPanel />
              </ScrollArea>
            </TabsContent>
            <TabsContent value="effects" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Effects Panel</h3>
                  <p className="text-sm text-zinc-400">Drag and drop effects onto your media</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center panel - Preview */}
        <ResizablePanel defaultSize={60} className="bg-[#0F1117]">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={70} className="flex items-center justify-center">
              <PreviewPanel videoRef={videoRef} />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            {/* Timeline panel */}
            <ResizablePanel defaultSize={30} className="bg-[#111520] border-t border-[#1D2130]">
              <TimelinePanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right panel - Properties */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="bg-[#111520] border-l border-[#1D2130]">
          <Tabs defaultValue="properties" className="w-full">
            <TabsList className="w-full bg-[#0A0D16] border-b border-[#1D2130]">
              <TabsTrigger value="properties" className="flex-1">Properties</TabsTrigger>
              <TabsTrigger value="generate" className="flex-1">Generate</TabsTrigger>
            </TabsList>
            <TabsContent value="properties" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">Properties Panel</h3>
                  <p className="text-sm text-zinc-400">Edit properties of selected media</p>
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="generate" className="p-0 m-0 h-[calc(100%-40px)]">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-2">AI Generation</h3>
                  <p className="text-sm text-zinc-400">Generate new media with AI</p>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default VideoEditor;

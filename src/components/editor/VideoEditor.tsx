
import React, { useEffect, useRef, useState } from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import TimelinePanel from './TimelinePanel';
import MediaPanel from './MediaPanel';
import PreviewPanel from './PreviewPanel';
import ToolbarPanel from './ToolbarPanel';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';

const VideoEditor = () => {
  const { 
    projectId,
    projectName, 
    isPlaying, 
    currentTime, 
    duration,
    togglePlayPause, 
    setCurrentTime, 
    setDuration,
    dialogs,
    openDialog,
    closeDialog,
    setProjectId,
    setProjectName,
    mediaItems
  } = useVideoEditor();
  
  const navigate = useNavigate();
  const params = useParams();
  const urlProjectId = params.projectId;
  
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [userAuthenticated, setUserAuthenticated] = useState<boolean | null>(null);
  const [projectCreationAttempted, setProjectCreationAttempted] = useState(false);

  // Reference to the video element for playback control
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if user is authenticated and handle URL projectId
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserAuthenticated(!!session);
      
      // If we have a projectId in the URL, set it in the store
      if (urlProjectId && urlProjectId !== projectId) {
        setProjectId(urlProjectId);
      }
    };
    
    checkAuth();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUserAuthenticated(!!session);
      }
    );
    
    return () => subscription.unsubscribe();
  }, [urlProjectId, projectId, setProjectId]);

  // Handle playback state changes
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);
  
  // Auto-create a project if needed
  useEffect(() => {
    const autoCreateProject = async () => {
      // Only attempt to create a project once and if we're authenticated
      if (!projectId && userAuthenticated && !isCreatingProject && !projectCreationAttempted) {
        setProjectCreationAttempted(true);
        await handleCreateDefaultProject();
      }
    };
    
    autoCreateProject();
  }, [projectId, userAuthenticated, projectCreationAttempted]);
  
  // Create a default project
  const handleCreateDefaultProject = async () => {
    try {
      setIsCreatingProject(true);
      
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please log in to create a project");
        return;
      }
      
      // Create default project
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: session.user.id,
          title: 'Untitled Project',
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Set project in store
      setProjectId(project.id);
      setProjectName(project.title);
      
      // Update URL with project ID
      navigate(`/editor/${project.id}`, { replace: true });
      
      toast.success("New project created");
    } catch (error) {
      console.error('Error creating default project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreatingProject(false);
    }
  };
  
  // If we're not authenticated, show login prompt
  if (userAuthenticated === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0D16] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="text-center mb-6">Please log in to use the video editor.</p>
        <Button
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </div>
    );
  }
  
  // If we don't have a project ID and are authenticated, show loading state
  if (!projectId && userAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-[#0A0D16] text-white p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-center">
          {isCreatingProject ? 'Creating new project...' : 'Loading project...'}
        </p>
      </div>
    );
  }

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


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { motion } from 'framer-motion';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';
import StoryboardSidebar from '@/components/storyboard/StoryboardSidebar';
import ShotsRow from '@/components/storyboard/ShotsRow';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProjectDetails, SceneDetails, CharacterDetails, SidebarData } from '@/types/storyboardTypes';

interface StoryboardPageProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const StoryboardPage = ({ viewMode, setViewMode }: StoryboardPageProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [scenes, setScenes] = useState<SceneDetails[]>([]);
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [characters, setCharacters] = useState<CharacterDetails[]>([]);
  const [selectedScene, setSelectedScene] = useState<SceneDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) {
        toast.error("Project ID not found in URL.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch project, scenes, and characters in parallel
        const [projectRes, scenesRes, charactersRes] = await Promise.all([
          supabase.from('projects').select('id, title, description, video_style').eq('id', projectId).single(),
          supabase.from('scenes').select('*').eq('project_id', projectId).order('scene_number', { ascending: true }),
          supabase.from('characters').select('*').eq('project_id', projectId)
        ]);

        // Process Project
        if (projectRes.error || !projectRes.data) {
          throw new Error(projectRes.error?.message || 'Failed to fetch project details.');
        }
        setProjectDetails(projectRes.data as ProjectDetails);

        // Process Scenes
        if (scenesRes.error) {
          throw new Error(scenesRes.error.message || 'Failed to fetch scenes.');
        }
        const fetchedScenes = (scenesRes.data || []) as SceneDetails[];
        setScenes(fetchedScenes);

        // Set initial selected scene (scene 1 or first available)
        const initialScene = fetchedScenes.length > 0 ? fetchedScenes[0] : null;
        setSelectedScene(initialScene);

        // Process Characters
        if (charactersRes.error) {
          throw new Error(charactersRes.error.message || 'Failed to fetch characters.');
        }
        setCharacters((charactersRes.data || []) as CharacterDetails[]);

        // Prepare Initial Sidebar Data
        setSidebarData({
          projectTitle: projectRes.data.title,
          projectDescription: projectRes.data.description,
          sceneDescription: initialScene?.description ?? null,
          sceneLocation: initialScene?.location ?? null,
          sceneLighting: initialScene?.lighting ?? null,
          sceneWeather: initialScene?.weather ?? null,
          videoStyle: projectRes.data.video_style ?? null,
          characters: (charactersRes.data || []) as CharacterDetails[]
        });

      } catch (error: any) {
        console.error("Error fetching storyboard data:", error);
        toast.error(`Failed to load storyboard: ${error.message}`);
        setProjectDetails(null);
        setScenes([]);
        setCharacters([]);
        setSelectedScene(null);
        setSidebarData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Function to update scene details in the database
  const handleSceneUpdate = async (sceneId: string | undefined, updates: Partial<Omit<SceneDetails, 'id' | 'project_id' | 'scene_number'>>) => {
    if (!sceneId) {
      toast.error("Cannot update scene: Scene ID is missing.");
      return;
    }
    try {
      const { error } = await supabase
        .from('scenes')
        .update(updates)
        .eq('id', sceneId);
      if (error) throw error;

      // Update local state for immediate feedback
      setSelectedScene(prev => prev ? { ...prev, ...updates } : null);
      setScenes(prevScenes => prevScenes.map(s => s.id === sceneId ? { ...s, ...updates } : s));
      setSidebarData(prev => prev ? {
        ...prev,
        sceneDescription: updates.description ?? prev.sceneDescription,
        sceneLocation: updates.location ?? prev.sceneLocation,
        sceneLighting: updates.lighting ?? prev.sceneLighting,
        sceneWeather: updates.weather ?? prev.sceneWeather,
      } : null);

    } catch (error: any) {
      console.error("Error updating scene:", error);
      toast.error(`Failed to update scene: ${error.message}`);
    }
  };

  // Add scene function
  const addScene = async () => {
    if (!projectId) return;
    const newSceneNumber = scenes.length > 0 ? Math.max(...scenes.map(s => s.scene_number)) + 1 : 1;
    try {
      const { data, error } = await supabase
        .from('scenes')
        .insert({ project_id: projectId, scene_number: newSceneNumber, title: `Scene ${newSceneNumber}` })
        .select()
        .single();
      if (error) throw error;
      if (data) {
        setScenes(prev => [...prev, data as SceneDetails]);
        toast.success(`Scene ${newSceneNumber} added.`);
      }
    } catch (error: any) {
      console.error("Error adding scene:", error);
      toast.error(`Failed to add scene: ${error.message}`);
    }
  };

  // Function to handle selecting a different scene
  const handleSelectScene = (scene: SceneDetails) => {
    setSelectedScene(scene);
    // Update sidebar data when scene changes
    setSidebarData(prev => projectDetails ? ({
      projectTitle: projectDetails.title,
      projectDescription: projectDetails.description,
      sceneDescription: scene.description ?? null,
      sceneLocation: scene.location ?? null,
      sceneLighting: scene.lighting ?? null,
      sceneWeather: scene.weather ?? null,
      videoStyle: projectDetails.video_style ?? null,
      characters: characters
    }) : null);
  };

  // Render logic
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0D16] text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="ml-3">Loading Storyboard...</span>
      </div>
    );
  }

  if (!projectDetails || !projectId) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0D16] text-white">
        <p>Could not load project data. Please check the project ID or go back.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <StoryboardHeader viewMode={viewMode} setViewMode={setViewMode} />
      <ResizablePanelGroup direction="horizontal" className="flex-grow">
        {/* Sidebar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30} className="h-full">
          {sidebarData ? (
            <StoryboardSidebar
              key={selectedScene?.id || 'no-scene'}
              data={sidebarData}
              onUpdate={(updates) => handleSceneUpdate(selectedScene?.id, updates)}
            />
          ) : (
            <div className="p-6 text-zinc-500">Loading sidebar...</div>
          )}
        </ResizablePanel>

        {/* Main content area */}
        <ResizablePanel defaultSize={80}>
          <div className="p-6 h-full overflow-y-auto relative">
            {scenes.length === 0 ? (
              <div className="text-center text-zinc-500 mt-20">
                No scenes found for this project. Add one below or generate them in Project Setup.
              </div>
            ) : (
              scenes.map(scene => (
                <div 
                  key={scene.id} 
                  onClick={() => handleSelectScene(scene)} 
                  className={`${selectedScene?.id === scene.id ? 'border-l-2 border-purple-500 pl-4 -ml-4 mb-12' : 'mb-12'}`}
                >
                  <ShotsRow
                    sceneId={scene.id}
                    sceneNumber={scene.scene_number}
                  />
                </div>
              ))
            )}
            {/* Floating Action Button to Add Scene */}
            <motion.button
              onClick={addScene}
              className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-gradient-to-br from-purple-600 to-indigo-600 p-0 flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-20"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Plus className="w-6 h-6 text-white" />
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

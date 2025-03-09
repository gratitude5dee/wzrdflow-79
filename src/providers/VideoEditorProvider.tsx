
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useParams } from "react-router-dom";

// Create context
const VideoEditorContext = createContext<null>(null);

// Provider component
export function VideoEditorProvider({ children }: { children: ReactNode }) {
  const { projectId, setProjectId, setProjectName, addMediaItem, reset } = useVideoEditorStore();
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();

  // Load project data if we have a project ID (either from params or stored)
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        // Check if we have a project ID in URL params
        const urlProjectId = params.projectId;
        
        if (urlProjectId) {
          setProjectId(urlProjectId);
        }
        
        // If we have a project ID (from params or previously set), load the project
        if (projectId) {
          setIsLoading(true);
          
          // Fetch project details
          const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();
            
          if (projectError) throw projectError;
          
          if (projectData) {
            setProjectName(projectData.title);
            
            // Fetch media items for this project
            const { data: mediaItems, error: mediaError } = await supabase
              .from('media_items')
              .select('*')
              .eq('project_id', projectId);
              
            if (mediaError) throw mediaError;
            
            // Add media items to the store
            if (mediaItems && mediaItems.length > 0) {
              mediaItems.forEach(item => {
                addMediaItem({
                  id: item.id,
                  type: item.media_type,
                  url: item.url || '',
                  name: item.name,
                  duration: item.duration,
                  startTime: item.start_time,
                  endTime: item.end_time
                });
              });
            }
            
            // We could also load tracks, track items, and keyframes here
          }
        }
      } catch (error) {
        console.error('Error loading project data:', error);
        toast.error('Failed to load project data');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, params.projectId]);
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      // Reset the store when the provider is unmounted
      reset();
    };
  }, []);

  return (
    <VideoEditorContext.Provider value={null}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : (
        children
      )}
    </VideoEditorContext.Provider>
  );
}

// Hook to use the store
export function useVideoEditor() {
  useContext(VideoEditorContext); // This ensures components using this hook are re-rendered when the context changes
  return useVideoEditorStore();
}

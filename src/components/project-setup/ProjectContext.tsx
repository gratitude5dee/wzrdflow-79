
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ProjectData, ProjectSetupTab } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

interface ProjectContextProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
  activeTab: ProjectSetupTab;
  setActiveTab: (tab: ProjectSetupTab) => void;
  saveProjectData: () => Promise<string | null>;
  projectId: string | null;
  getVisibleTabs: () => ProjectSetupTab[];
  previousOption: 'ai' | 'manual';
  isCreating: boolean;
  setIsCreating: (creating: boolean) => void;
  handleCreateProject: () => Promise<void>;
}

const defaultProjectData: ProjectData = {
  title: 'Untitled Project',
  concept: '',
  genre: '',
  tone: '',
  format: 'custom',
  customFormat: '',
  specialRequests: '',
  addVoiceover: false,
  product: '',
  targetAudience: '',
  mainMessage: '',
  callToAction: '',
  conceptOption: 'ai'
};

const ProjectContext = createContext<ProjectContextProps | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProjectSetupTab>('concept');
  const [isCreating, setIsCreating] = useState(false);
  const [previousOption, setPreviousOption] = useState<'ai' | 'manual'>('ai');
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const [projectData, setProjectData] = useState<ProjectData>(defaultProjectData);
  
  // Track option changes for smooth transitions
  useEffect(() => {
    if (previousOption !== projectData.conceptOption) {
      setPreviousOption(projectData.conceptOption);
      
      // If switching from AI to manual and currently on storyline tab, move to settings
      if (previousOption === 'ai' && projectData.conceptOption === 'manual' && activeTab === 'storyline') {
        setActiveTab('settings');
      }
    }
  }, [projectData.conceptOption, activeTab, previousOption]);
  
  const updateProjectData = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  // Save project data to Supabase
  const saveProjectData = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to create a project");
      return null;
    }

    try {
      console.log('Saving project data:', projectData);
      console.log('Current user:', user);
      
      const projectPayload = {
        user_id: user.id,
        title: projectData.title || 'Untitled Project',
        concept_text: projectData.concept,
        concept_option: projectData.conceptOption,
        format: projectData.format,
        custom_format_description: projectData.customFormat,
        genre: projectData.genre,
        tone: projectData.tone,
        add_voiceover: projectData.addVoiceover,
        special_requests: projectData.specialRequests,
        product_name: projectData.product,
        target_audience: projectData.targetAudience,
        main_message: projectData.mainMessage,
        call_to_action: projectData.callToAction
      };
      
      console.log('Project payload:', projectPayload);

      // If project already exists, update it
      if (projectId) {
        const { error } = await supabase
          .from('projects')
          .update(projectPayload)
          .eq('id', projectId);
          
        if (error) {
          console.error('Error updating project:', error);
          throw error;
        }
        
        toast.success("Project updated successfully");
        return projectId;
      } else {
        // Create new project
        const { data: project, error } = await supabase
          .from('projects')
          .insert(projectPayload)
          .select()
          .single();
          
        if (error) {
          console.error('Error creating project:', error);
          throw error;
        }
        
        setProjectId(project.id);
        toast.success("Project created successfully");
        return project.id;
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error("Failed to save project");
      return null;
    }
  };

  // Function to get visible tabs based on the conceptOption
  const getVisibleTabs = (): ProjectSetupTab[] => {
    if (projectData.conceptOption === 'manual') {
      // Skip storyline tab for manual mode
      return ['concept', 'settings', 'breakdown'];
    } else {
      // Show all tabs for AI mode
      return ['concept', 'storyline', 'settings', 'breakdown'];
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      toast.error("Please log in to create a project");
      return;
    }

    try {
      setIsCreating(true);
      
      // Save final project data if needed
      const savedProjectId = await saveProjectData();
      if (!savedProjectId) {
        throw new Error("Failed to save project data");
      }
      
      toast.success("Project created successfully");
      
      // Navigate to the editor with the new project ID
      // This will be done at the component level
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projectData,
      updateProjectData,
      activeTab,
      setActiveTab,
      saveProjectData,
      projectId,
      getVisibleTabs,
      previousOption,
      isCreating,
      setIsCreating,
      handleCreateProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

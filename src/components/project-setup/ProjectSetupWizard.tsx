
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ConceptTab from './ConceptTab';
import StorylineTab from './StorylineTab';
import SettingsTab from './SettingsTab';
import BreakdownTab from './BreakdownTab';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';

type ProjectSetupTab = 'concept' | 'storyline' | 'settings' | 'breakdown';

export interface ProjectData {
  title: string;
  concept: string;
  genre: string;
  tone: string;
  format: string;
  customFormat?: string;
  specialRequests?: string;
  addVoiceover: boolean;
}

const ProjectSetupWizard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ProjectSetupTab>('concept');
  const [isCreating, setIsCreating] = useState(false);
  
  const [projectData, setProjectData] = useState<ProjectData>({
    title: 'Untitled Project',
    concept: '',
    genre: '',
    tone: '',
    format: 'custom',
    customFormat: '',
    specialRequests: '',
    addVoiceover: false
  });

  const handleUpdateProjectData = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const tabs: ProjectSetupTab[] = ['concept', 'storyline', 'settings', 'breakdown'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleCreateProject();
    }
  };

  const handleCreateProject = async () => {
    if (!user) {
      toast.error("Please log in to create a project");
      return;
    }

    try {
      setIsCreating(true);
      
      // Create project in database
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectData.title || 'Untitled Project',
          metadata: {
            concept: projectData.concept,
            genre: projectData.genre,
            tone: projectData.tone,
            format: projectData.format,
            customFormat: projectData.customFormat,
            specialRequests: projectData.specialRequests,
            addVoiceover: projectData.addVoiceover
          }
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success("Project created successfully");
      
      // Navigate to the editor with the new project ID
      navigate(`/editor/${project.id}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ProjectSetupTab)}>
            <TabsList className="h-16 bg-transparent grid grid-cols-4 gap-4">
              <TabsTrigger 
                value="concept" 
                className={`data-[state=active]:bg-blue-950 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 rounded-md w-full h-10`}
              >
                CONCEPT
              </TabsTrigger>
              <TabsTrigger 
                value="storyline" 
                className={`data-[state=active]:bg-blue-950 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 rounded-md w-full h-10`}
              >
                STORYLINE
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className={`data-[state=active]:bg-blue-950 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 rounded-md w-full h-10`}
              >
                SETTINGS & CAST
              </TabsTrigger>
              <TabsTrigger 
                value="breakdown" 
                className={`data-[state=active]:bg-blue-950 data-[state=active]:text-white data-[state=active]:border-none data-[state=inactive]:bg-transparent data-[state=inactive]:text-gray-400 rounded-md w-full h-10`}
              >
                BREAKDOWN
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'concept' && <ConceptTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'storyline' && <StorylineTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'settings' && <SettingsTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'breakdown' && <BreakdownTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
      </div>

      {/* Footer with Next button */}
      <div className="border-t border-zinc-800 p-4 flex justify-end">
        <Button
          onClick={handleNext}
          disabled={isCreating}
          className="bg-gray-700 hover:bg-gray-600 text-white px-8"
        >
          {isCreating ? 'Creating...' : activeTab === 'breakdown' ? 'Create Project' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectSetupWizard;


import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConceptTab from './ConceptTab';
import StorylineTab from './StorylineTab';
import SettingsTab from './SettingsTab';
import BreakdownTab from './BreakdownTab';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/providers/AuthProvider';
import ProjectSetupHeader from './ProjectSetupHeader';
import { ArrowRight, ChevronRight } from 'lucide-react';

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
  // Commercial-specific fields
  product?: string;
  targetAudience?: string;
  mainMessage?: string;
  callToAction?: string;
  // Additional field to track AI or manual mode
  conceptOption: 'ai' | 'manual';
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
    addVoiceover: false,
    // Commercial-specific fields initialized as empty
    product: '',
    targetAudience: '',
    mainMessage: '',
    callToAction: '',
    // Default to AI mode
    conceptOption: 'ai'
  });

  const handleUpdateProjectData = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    const tabs = getVisibleTabs();
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      handleCreateProject();
    }
  };

  const handleBack = () => {
    const tabs = getVisibleTabs();
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
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
            addVoiceover: projectData.addVoiceover,
            // Include commercial fields in metadata
            product: projectData.product,
            targetAudience: projectData.targetAudience,
            mainMessage: projectData.mainMessage,
            callToAction: projectData.callToAction,
            // Include the conceptOption
            conceptOption: projectData.conceptOption
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

  // Get the current visible tabs
  const visibleTabs = getVisibleTabs();

  return (
    <div className="min-h-screen flex flex-col bg-[#111319]">
      {/* Header */}
      <ProjectSetupHeader />
      
      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800 bg-[#0F1219]">
        <div className="container mx-auto">
          <div className="flex">
            {visibleTabs.map((tab, index) => (
              <div 
                key={tab}
                className={`relative ${
                  index > 0 ? 'flex-1' : ''
                }`}
              >
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 w-full relative transition-all duration-200 flex items-center justify-center ${
                    activeTab === tab
                      ? 'text-white font-medium bg-[#0050E4]'
                      : 'text-zinc-400'
                  }`}
                >
                  {tab === 'concept' ? 'CONCEPT' : 
                   tab === 'storyline' ? 'STORYLINE' :
                   tab === 'settings' ? 'SETTINGS & CAST' : 'BREAKDOWN'}
                  {index < visibleTabs.length - 1 && (
                    <ChevronRight className={`ml-2 h-4 w-4 ${
                      activeTab === tab ? 'text-white' : 'text-zinc-600'
                    }`} />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto bg-[#111319]">
        {activeTab === 'concept' && <ConceptTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'storyline' && <StorylineTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'settings' && <SettingsTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
        {activeTab === 'breakdown' && <BreakdownTab projectData={projectData} updateProjectData={handleUpdateProjectData} />}
      </div>

      {/* Footer with navigation buttons */}
      <div className="border-t border-zinc-800 p-4 flex justify-between">
        <Button
          onClick={handleBack}
          variant="ghost"
          className={`text-white hover:bg-zinc-800 ${activeTab === 'concept' ? 'invisible' : ''}`}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 ml-auto"
        >
          {isCreating ? 'Creating...' : activeTab === visibleTabs[visibleTabs.length - 1] ? 'Start' : 'Next'}
          {activeTab !== visibleTabs[visibleTabs.length - 1] && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ProjectSetupWizard;

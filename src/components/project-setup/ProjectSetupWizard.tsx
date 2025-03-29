
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
import { ArrowRight } from 'lucide-react';

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
    callToAction: ''
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
            addVoiceover: projectData.addVoiceover,
            // Include commercial fields in metadata
            product: projectData.product,
            targetAudience: projectData.targetAudience,
            mainMessage: projectData.mainMessage,
            callToAction: projectData.callToAction
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

  // Tab configuration
  const tabs: Array<{ id: ProjectSetupTab; label: string }> = [
    { id: 'concept', label: 'CONCEPT' },
    { id: 'storyline', label: 'STORYLINE' },
    { id: 'settings', label: 'SETTINGS & CAST' },
    { id: 'breakdown', label: 'BREAKDOWN' }
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <ProjectSetupHeader />
      
      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800 bg-[#0F1219]">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-12 relative transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-white font-medium'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
                )}
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className={`${activeTab === tab.id ? 'text-white' : 'text-zinc-600'}`}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </button>
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
        {activeTab === 'breakdown' ? (
          <Button
            variant="outline"
            onClick={() => setActiveTab('settings')}
            className="border-zinc-700 text-white hover:bg-zinc-800"
          >
            Back
          </Button>
        ) : (
          <div></div>
        )}
        
        <Button
          onClick={handleNext}
          disabled={isCreating}
          className={`${
            activeTab === 'breakdown' 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white px-8`}
        >
          {isCreating ? 'Creating...' : activeTab === 'breakdown' ? 'Start' : 'Next'}
          {activeTab !== 'breakdown' && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default ProjectSetupWizard;

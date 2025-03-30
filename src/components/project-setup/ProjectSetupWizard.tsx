
import { useState, useEffect } from 'react';
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
import { ArrowRight, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [previousOption, setPreviousOption] = useState<'ai' | 'manual'>('ai');
  const [projectId, setProjectId] = useState<string | null>(null);
  
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
  
  const handleUpdateProjectData = (data: Partial<ProjectData>) => {
    setProjectData(prev => ({ ...prev, ...data }));
  };

  // Save project data to Supabase
  const saveProjectData = async (): Promise<string | null> => {
    if (!user) {
      toast.error("Please log in to create a project");
      return null;
    }

    try {
      // If project already exists, update it
      if (projectId) {
        const { error } = await supabase
          .from('projects')
          .update({
            title: projectData.title,
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
          })
          .eq('id', projectId);
          
        if (error) throw error;
        return projectId;
      } else {
        // Create new project
        const { data: project, error } = await supabase
          .from('projects')
          .insert({
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
          })
          .select()
          .single();
          
        if (error) throw error;
        return project.id;
      }
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast.error("Failed to save project");
      return null;
    }
  };

  const handleNext = async () => {
    const tabs = getVisibleTabs();
    const currentIndex = tabs.indexOf(activeTab);
    
    // If currently on concept tab, save project data before proceeding
    if (activeTab === 'concept') {
      const savedProjectId = await saveProjectData();
      if (savedProjectId) {
        setProjectId(savedProjectId);
      } else {
        // If saving failed, don't proceed
        return;
      }
    }
    
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
      
      // Save final project data if needed
      const savedProjectId = await saveProjectData();
      if (!savedProjectId) {
        throw new Error("Failed to save project data");
      }
      
      toast.success("Project created successfully");
      
      // Navigate to the editor with the new project ID
      navigate(`/editor/${savedProjectId}`);
    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  // Get the current visible tabs
  const visibleTabs = getVisibleTabs();
  const isLastTab = activeTab === visibleTabs[visibleTabs.length - 1];
  const isFirstTab = activeTab === visibleTabs[0];

  // Animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#111319]">
      {/* Header */}
      <ProjectSetupHeader />
      
      {/* Tabs Navigation */}
      <div className="border-b border-zinc-800 bg-[#0F1219]">
        <div className="container mx-auto">
          <motion.div 
            className="flex"
            initial={false}
            animate={{ height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {visibleTabs.map((tab, index) => (
              <motion.div 
                key={tab}
                className={`relative ${index > 0 ? 'flex-1' : ''}`}
                initial={false}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-6 w-full relative transition-all duration-300 flex items-center justify-center ${
                    activeTab === tab
                      ? 'text-white font-medium bg-[#0050E4]'
                      : index < visibleTabs.indexOf(activeTab) 
                        ? 'text-blue-400 bg-[#131B2E]'
                        : 'text-zinc-400'
                  }`}
                >
                  {tab === 'concept' ? 'CONCEPT' : 
                   tab === 'storyline' ? 'STORYLINE' :
                   tab === 'settings' ? 'SETTINGS & CAST' : 'BREAKDOWN'}
                  {index < visibleTabs.length - 1 && (
                    <ChevronRight className={`ml-2 h-4 w-4 ${
                      activeTab === tab || index < visibleTabs.indexOf(activeTab) ? 'text-white' : 'text-zinc-600'
                    }`} />
                  )}
                </button>
                {activeTab === tab && (
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500"
                    layoutId="activeTabIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div className="flex-1 overflow-auto bg-[#111319]">
        <AnimatePresence mode="wait">
          {activeTab === 'concept' && (
            <motion.div
              key="concept"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <ConceptTab projectData={projectData} updateProjectData={handleUpdateProjectData} />
            </motion.div>
          )}
          {activeTab === 'storyline' && (
            <motion.div
              key="storyline"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <StorylineTab projectData={projectData} updateProjectData={handleUpdateProjectData} />
            </motion.div>
          )}
          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <SettingsTab projectData={projectData} updateProjectData={handleUpdateProjectData} />
            </motion.div>
          )}
          {activeTab === 'breakdown' && (
            <motion.div
              key="breakdown"
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <BreakdownTab projectData={projectData} updateProjectData={handleUpdateProjectData} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer with navigation buttons */}
      <motion.div 
        className="border-t border-zinc-800 p-4 flex justify-between items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button
          onClick={handleBack}
          variant="outline"
          className={`text-white border-zinc-700 hover:bg-zinc-800 hover:text-white flex items-center gap-2 transition-all duration-300 ${isFirstTab ? 'opacity-0 pointer-events-none' : ''}`}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        
        <div className="flex-1 flex justify-center">
          <div className="flex space-x-2">
            {visibleTabs.map((tab, i) => (
              <motion.div 
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i === visibleTabs.indexOf(activeTab) 
                    ? 'bg-blue-500' 
                    : i < visibleTabs.indexOf(activeTab)
                      ? 'bg-blue-800'
                      : 'bg-zinc-700'
                }`}
                initial={false}
                animate={{ 
                  scale: i === visibleTabs.indexOf(activeTab) ? 1.2 : 1,
                  backgroundColor: i === visibleTabs.indexOf(activeTab) 
                    ? 'rgb(59, 130, 246)' 
                    : i < visibleTabs.indexOf(activeTab)
                      ? 'rgb(30, 64, 175)'
                      : 'rgb(63, 63, 70)'
                }}
                transition={{ duration: 0.3 }}
              />
            ))}
          </div>
        </div>
        
        <Button
          onClick={handleNext}
          disabled={isCreating}
          className={`px-8 flex items-center gap-2 transition-all duration-300 ${
            isLastTab 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isCreating ? 'Creating...' : isLastTab ? 'Start Project' : 'Next'}
          {!isLastTab && <ArrowRight className="h-4 w-4" />}
        </Button>
      </motion.div>
    </div>
  );
};

export default ProjectSetupWizard;


import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useProject } from './ProjectContext';

const NavigationFooter = () => {
  const navigate = useNavigate();
  const { 
    activeTab, 
    getVisibleTabs, 
    saveProjectData, 
    setActiveTab, 
    isCreating,
    isGenerating,
    generateStoryline,
    projectData,
    handleCreateProject 
  } = useProject();

  const visibleTabs = getVisibleTabs();
  const isLastTab = activeTab === visibleTabs[visibleTabs.length - 1];
  const isFirstTab = activeTab === visibleTabs[0];

  const handleNext = async () => {
    const tabs = getVisibleTabs();
    const currentIndex = tabs.indexOf(activeTab);
    
    // If currently on concept tab, save project data before proceeding
    if (activeTab === 'concept') {
      const savedProjectId = await saveProjectData();
      if (!savedProjectId) {
        // If saving failed, don't proceed
        return;
      }
      
      // If using AI generation, call the generate-storylines function before proceeding
      if (projectData.conceptOption === 'ai') {
        const success = await generateStoryline(savedProjectId);
        if (!success) {
          // If generation failed, we still proceed to the next tab but show an error
          // The error toast is already shown in the generateStoryline function
        }
      }
    }
    
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else {
      const result = await handleCreateProject();
      // Navigate after successful project creation
      const projectId = await saveProjectData();
      if (projectId) {
        navigate(`/editor/${projectId}`);
      }
    }
  };

  const handleBack = () => {
    const tabs = getVisibleTabs();
    const currentIndex = tabs.indexOf(activeTab);
    
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // Determine the button text based on various states
  const getNextButtonText = () => {
    if (isGenerating) return "Generating...";
    if (isCreating) return "Creating...";
    if (isLastTab) return "Start Project";
    return "Next";
  };

  // Determine if the next button should be disabled
  const isNextButtonDisabled = isCreating || isGenerating;

  return (
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
        disabled={isNextButtonDisabled}
        className={`px-8 flex items-center gap-2 transition-all duration-300 ${
          isLastTab 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {getNextButtonText()}
        {isGenerating || isCreating ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : !isLastTab ? (
          <ArrowRight className="h-4 w-4" />
        ) : null}
      </Button>
    </motion.div>
  );
};

export default NavigationFooter;

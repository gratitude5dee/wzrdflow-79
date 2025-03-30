
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useProject } from './ProjectContext';

const NavigationFooter = () => {
  const navigate = useNavigate();
  const { 
    activeTab, 
    getVisibleTabs, 
    saveProjectData, 
    setActiveTab, 
    isCreating, 
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
  );
};

export default NavigationFooter;

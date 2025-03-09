
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, FileCode, Users, Music, Mic, Play, Share, Undo, Redo } from 'lucide-react';
import { motion } from 'framer-motion';

const StoryboardHeader = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'storyboard' | 'shot-editor'>('storyboard');

  const handleTabChange = (tab: 'storyboard' | 'shot-editor') => {
    setActiveTab(tab);
    if (tab === 'storyboard') {
      navigate('/editor');
    } else {
      navigate('/shot-editor');
    }
  };

  return (
    <header className="w-full bg-[#0A0D16] border-b border-[#1D2130] px-6 py-3 shadow-lg sticky top-0 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-yellow-400 mr-4 font-serif tracking-wider glow-text">
            WZRD.STUDIO
            <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded ml-2">
              ALPHA
            </span>
          </div>
          
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] glow-button">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] glow-button">
            <FileCode className="h-4 w-4 mr-2" />
            Style
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] glow-button">
            <Users className="h-4 w-4 mr-2" />
            Cast
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] glow-button">
            <Music className="h-4 w-4 mr-2" />
            Soundtrack
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] glow-button">
            <Mic className="h-4 w-4 mr-2" />
            Voiceover
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-[#121524] rounded-md overflow-hidden p-1 border border-[#1D2130]">
            <motion.button 
              className={`px-6 py-1.5 text-sm rounded ${activeTab === 'storyboard' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-white/70 hover:text-white'}`}
              onClick={() => handleTabChange('storyboard')}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              STORYBOARD
            </motion.button>
            <motion.button 
              className={`px-6 py-1.5 text-sm rounded ${activeTab === 'shot-editor' ? 'bg-purple-600 text-white shadow-glow-purple' : 'text-white/70 hover:text-white'}`}
              onClick={() => handleTabChange('shot-editor')}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              SHOT EDITOR
            </motion.button>
          </div>
          
          <Button 
            variant="ghost" 
            className="bg-transparent hover:bg-[#1D2130] border border-[#1D2130] text-white glow-button-subtle"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="bg-transparent hover:bg-[#1D2130] border border-[#1D2130] text-white glow-button-subtle"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="bg-[#1D2130] hover:bg-[#262B3D] text-white gap-2 glow-button"
          >
            <Play className="w-4 h-4" />
            <span>Preview</span>
          </Button>
          <Button 
            variant="ghost" 
            className="bg-[#1D2130] hover:bg-[#262B3D] text-white gap-2 glow-button"
          >
            <Share className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default StoryboardHeader;

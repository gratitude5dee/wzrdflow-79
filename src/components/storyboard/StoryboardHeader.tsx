
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, FileCode, Users, Music, Mic, Play, Share, Undo, Redo } from 'lucide-react';
import { motion } from 'framer-motion';
import { ViewModeSelector } from '@/components/home/ViewModeSelector';

interface StoryboardHeaderProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const StoryboardHeader = ({ viewMode, setViewMode }: StoryboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#0A0D16] border-b border-[#1D2130] px-6 py-3 shadow-lg sticky top-0 z-10">
      {/* Top row with branding and view mode selector */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-yellow-300 tracking-tight mr-2">WZRD.STUDIO</h1>
          <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
        </div>
        
        <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="bg-[#1D2130] hover:bg-[#262B3D] text-white"
            onClick={() => navigate('/home')}
          >
            Back to Projects
          </Button>
        </div>
      </div>
      
      {/* Bottom row with other buttons */}
      <div className="flex items-center justify-between">
        {/* Left section with navigation buttons */}
        <div className="flex items-center space-x-6">
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
        
        {/* Right section with action buttons */}
        <div className="flex items-center gap-4">
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

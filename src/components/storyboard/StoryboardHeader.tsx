
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Settings, FileCode, Users, Music, Mic, Play, Share, Undo, Redo } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryboardHeaderProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const StoryboardHeader = ({ viewMode, setViewMode }: StoryboardHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-[#0A0D16]/80 backdrop-blur-lg border-b border-white/10 px-6 py-3 shadow-lg sticky top-0 z-10">
      {/* Bottom row with other buttons */}
      <div className="flex items-center justify-between">
        {/* Left section with navigation buttons */}
        <div className="flex items-center space-x-6">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 glow-button">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 glow-button">
            <FileCode className="h-4 w-4 mr-2" />
            Style
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 glow-button">
            <Users className="h-4 w-4 mr-2" />
            Cast
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 glow-button">
            <Music className="h-4 w-4 mr-2" />
            Soundtrack
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/5 glow-button">
            <Mic className="h-4 w-4 mr-2" />
            Voiceover
          </Button>
        </div>
        
        {/* Right section with action buttons */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="bg-transparent hover:bg-white/5 border border-white/10 text-white glow-button-subtle"
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="bg-transparent hover:bg-white/5 border border-white/10 text-white glow-button-subtle"
          >
            <Redo className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            className="bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white gap-2 glow-button border border-white/10"
          >
            <Play className="w-4 h-4" />
            <span>Preview</span>
          </Button>
          <Button 
            variant="ghost" 
            className="bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white gap-2 glow-button border border-white/10"
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

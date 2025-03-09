
import React from 'react';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';

interface ShotEditorProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const ShotEditor = ({ viewMode, setViewMode }: ShotEditorProps) => {
  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <StoryboardHeader viewMode={viewMode} setViewMode={setViewMode} />
      
      <div className="flex-1 flex items-center justify-center bg-[#0F1117] text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-400 mb-4">Shot Editor Page</h1>
          <p className="text-zinc-400">This page is under construction</p>
        </div>
      </div>
    </div>
  );
};

export default ShotEditor;

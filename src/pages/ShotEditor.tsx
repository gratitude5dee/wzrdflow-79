
import React from 'react';
import StoryboardHeader from '@/components/storyboard/StoryboardHeader';
import VideoEditor from '@/components/editor/VideoEditor';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import { useParams, Navigate } from 'react-router-dom';

interface ShotEditorProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const ShotEditor = ({ viewMode, setViewMode }: ShotEditorProps) => {
  const params = useParams();
  const projectId = params.projectId;

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <StoryboardHeader viewMode={viewMode} setViewMode={setViewMode} />
      
      <div className="flex-1 bg-[#0F1117] overflow-hidden">
        <VideoEditorProvider>
          <VideoEditor />
        </VideoEditorProvider>
      </div>
    </div>
  );
};

export default ShotEditor;

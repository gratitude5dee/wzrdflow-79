
import React from 'react';
import VideoEditor from '@/components/editor/VideoEditor';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import { useParams } from 'react-router-dom';
import { useSyncVideoEditorState } from '@/integrations/stateIntegration';

interface ShotEditorProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const ShotEditor = ({ viewMode, setViewMode }: ShotEditorProps) => {
  const params = useParams();
  const projectId = params.projectId;
  
  // This is an example of how you could integrate with your external state
  // If you're not using redux, adapt this to your state management solution
  /*
  const { project } = useYourExistingStateHook();
  
  // Set up synchronization between your existing state and the video editor state
  useSyncVideoEditorState({
    projectId: project?.id || null,
    projectName: project?.name || 'Untitled Project',
  });
  */

  return (
    <div className="flex flex-col h-screen bg-[#0A0D16]">
      <div className="flex-1 bg-[#0F1117] overflow-hidden">
        <VideoEditorProvider>
          <VideoEditor />
        </VideoEditorProvider>
      </div>
    </div>
  );
};

export default ShotEditor;


import React from 'react';
import { VideoEditorProvider, useVideoEditor } from '@/providers/VideoEditorProvider';
import VideoEditor from '@/components/editor/VideoEditor';
import { useSyncVideoEditorState } from '@/integrations/stateIntegration';
import { useYourExistingStateHook } from '@/your-state-path'; // Replace with your actual import

interface VideoEditorIntegrationProps {
  projectId?: string | null;
  projectName?: string;
}

/**
 * This component wraps the video editor and handles state synchronization
 * between your existing state management and the video editor's Zustand store
 */
const VideoEditorIntegration: React.FC<VideoEditorIntegrationProps> = ({
  projectId,
  projectName
}) => {
  // Get data from your existing state management
  const { dispatch, mediaItems: existingMediaItems } = useYourExistingStateHook();
  
  // Set up synchronization between your existing state and the video editor state
  useSyncVideoEditorState({
    projectId,
    projectName,
    onMediaItemsChange: (mediaItems) => {
      // When video editor media items change, update your existing state if needed
      dispatch({ 
        type: 'UPDATE_MEDIA_ITEMS',
        payload: mediaItems
      });
    }
  });

  return (
    <VideoEditorProvider>
      <VideoEditor />
    </VideoEditorProvider>
  );
};

export default VideoEditorIntegration;

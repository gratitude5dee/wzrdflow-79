
import React from 'react';
import { VideoEditorProvider } from '@/providers/VideoEditorProvider';
import VideoEditorComponent from '@/components/editor/VideoEditor';
import { useParams } from 'react-router-dom';

const VideoEditor = () => {
  const params = useParams();
  const projectId = params.projectId;

  return (
    <VideoEditorProvider>
      <VideoEditorComponent />
    </VideoEditorProvider>
  );
};

export default VideoEditor;

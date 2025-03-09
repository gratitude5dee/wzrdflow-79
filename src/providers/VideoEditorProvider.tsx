
import React, { createContext, useContext, ReactNode } from 'react';
import { useVideoEditorStore } from '@/store/videoEditorStore';

// Create context
const VideoEditorContext = createContext<null>(null);

// Provider component
export function VideoEditorProvider({ children }: { children: ReactNode }) {
  return (
    <VideoEditorContext.Provider value={null}>
      {children}
    </VideoEditorContext.Provider>
  );
}

// Hook to use the store
export function useVideoEditor() {
  useContext(VideoEditorContext); // This ensures components using this hook are re-rendered when the context changes
  return useVideoEditorStore();
}

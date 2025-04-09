
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Canvas from '../components/Canvas';
import BottomStatusBar from '../components/BottomStatusBar';
import { ReactFlowProvider } from 'reactflow';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'reactflow/dist/style.css';
import StoryboardPage from './Storyboard';
import ShotEditor from './ShotEditor'; 
import StudioPage from './StudioPage';

interface IndexProps {
  viewMode?: 'studio' | 'storyboard' | 'editor';
}

const Index = ({ viewMode: initialViewMode }: IndexProps) => {
  const { projectId } = useParams<{ projectId?: string }>();
  const [viewMode, setViewMode] = useState<'studio' | 'storyboard' | 'editor'>(initialViewMode || 'storyboard');
  const navigate = useNavigate();
  
  // Log the projectId to help with debugging
  useEffect(() => {
    if (projectId) {
      console.log(`Index: Loaded with projectId: ${projectId}`);
    }
  }, [projectId]);
  
  // Handle navigation based on view mode changes
  useEffect(() => {
    if (viewMode === 'studio' && !window.location.pathname.includes('/studio')) {
      navigate('/studio');
    } else if (viewMode === 'storyboard' && projectId && !window.location.pathname.includes('/storyboard')) {
      navigate(`/storyboard/${projectId}`);
    } else if (viewMode === 'editor' && projectId && !window.location.pathname.includes('/editor')) {
      navigate(`/editor/${projectId}`);
    }
  }, [viewMode, projectId, navigate]);

  return (
    <ReactFlowProvider>
      <div className="w-screen h-screen bg-[#0F1117] flex flex-col">
        {viewMode !== 'studio' && (
          <Header viewMode={viewMode} setViewMode={setViewMode} />
        )}
        
        {viewMode === 'studio' && (
          <StudioPage />
        )}
        
        {viewMode === 'storyboard' && (
          <StoryboardPage 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
        )}
        
        {viewMode === 'editor' && (
          <ShotEditor 
            viewMode={viewMode} 
            setViewMode={setViewMode} 
          />
        )}
        
        {viewMode !== 'studio' && <BottomStatusBar />}
      </div>
    </ReactFlowProvider>
  );
};

export default Index;

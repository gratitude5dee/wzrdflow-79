
import WorldBuilderSidebar from '../components/WorldBuilderSidebar';
import FlowCanvas from '../components/FlowCanvas';
import ParametersSidebar from '../components/ParametersSidebar';
import TopControls from '../components/TopControls';

const Index = () => {
  return (
    <div className="flex h-screen bg-black">
      <WorldBuilderSidebar />
      <div className="flex-1 relative">
        <TopControls />
        <FlowCanvas />
      </div>
      <ParametersSidebar />
    </div>
  );
};

export default Index;

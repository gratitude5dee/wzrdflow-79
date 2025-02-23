
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Canvas from '../components/Canvas';
import 'reactflow/dist/style.css';

const Index = () => {
  return (
    <div className="w-screen h-screen bg-zinc-900">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <LeftSidebar />
        <Canvas />
      </div>
    </div>
  );
};

export default Index;

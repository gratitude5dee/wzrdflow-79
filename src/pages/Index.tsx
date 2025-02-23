
import Header from '../components/Header';
import LeftSidebar from '../components/LeftSidebar';
import Canvas from '../components/Canvas';
import BottomStatusBar from '../components/BottomStatusBar';
import 'reactflow/dist/style.css';

const Index = () => {
  return (
    <div className="w-screen h-screen bg-zinc-900 flex flex-col">
      <Header />
      <div className="flex flex-1 h-[calc(100vh-4rem-1.5rem)]">
        <LeftSidebar />
        <Canvas />
      </div>
      <BottomStatusBar />
    </div>
  );
};

export default Index;


import { MiniMap } from 'reactflow';

const ParametersSidebar = () => {
  return (
    <div className="w-64 h-screen bg-[#0C0C0C] border-l border-zinc-800/50 flex flex-col">
      <div className="p-4">
        <h2 className="text-[11px] font-medium tracking-wider text-zinc-500">PARAMETERS</h2>
        <p className="mt-4 text-sm text-zinc-400">
          Select a Model Node to view its parameters...
        </p>
      </div>
      
      <div className="mt-auto p-4">
        <h3 className="text-[11px] font-medium tracking-wider text-zinc-500 mb-2">MINIMAP</h3>
        <div className="w-full h-32 bg-zinc-800/50 rounded-lg overflow-hidden">
          <MiniMap 
            className="!bg-transparent"
            maskColor="rgba(0, 0, 0, 0.5)"
            nodeColor="#525252"
            nodeStrokeColor="#404040"
            nodeBorderRadius={4}
          />
        </div>
      </div>
    </div>
  );
};

export default ParametersSidebar;

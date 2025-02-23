
import { Node } from 'reactflow';
import { MiniMap } from 'reactflow';
import PropertiesPanel from './PropertiesPanel';

interface RightSidebarProps {
  selectedNode: Node | null;
  onNodeChange: (nodeId: string, data: any) => void;
}

const RightSidebar = ({ selectedNode, onNodeChange }: RightSidebarProps) => {
  return (
    <div className="w-64 h-full bg-zinc-900 border-l border-zinc-800 flex flex-col">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-400">Properties</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <PropertiesPanel 
          selectedNode={selectedNode} 
          onNodeChange={onNodeChange} 
        />
      </div>
      <div className="p-4 border-t border-zinc-800">
        <MiniMap 
          className="!bg-zinc-800 rounded-lg border border-zinc-700"
          maskColor="rgba(0, 0, 0, 0.5)"
          nodeColor="#525252"
          nodeStrokeColor="#404040"
          nodeBorderRadius={4}
          style={{ height: 120 }}
        />
      </div>
    </div>
  );
};

export default RightSidebar;


import { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  addEdge,
} from 'reactflow';
import CustomEdge from './CustomEdge';
import RightSidebar from './RightSidebar';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Start Node' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    type: 'default',
    data: { label: 'End Node' },
    position: { x: 250, y: 100 },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    data: { dashed: true },
  },
];

const edgeTypes = {
  custom: CustomEdge,
};

const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({ ...connection, type: 'custom' }, eds));
  }, [setEdges]);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeChange = useCallback((nodeId: string, data: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [setNodes]);

  return (
    <div className="flex w-full h-full">
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          edgeTypes={edgeTypes}
          fitView
          className="bg-zinc-900"
          minZoom={0.2}
          maxZoom={4}
          defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
        >
          <Background color="#333" className="bg-zinc-900" />
          <Controls className="fill-white stroke-white" />
          
          {/* Navigation Instructions */}
          <Panel position="bottom-center" className="bg-zinc-800/50 p-3 rounded-lg backdrop-blur mb-4">
            <div className="flex gap-6 text-sm text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700/50 rounded">Middle Click + Drag</span>
                <span>Pan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700/50 rounded">Scroll</span>
                <span>Zoom</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-zinc-700/50 rounded">Drag</span>
                <span>Move Nodes</span>
              </div>
            </div>
          </Panel>
        </ReactFlow>
      </div>
      <RightSidebar 
        selectedNode={selectedNode}
        onNodeChange={onNodeChange}
      />
    </div>
  );
};

export default Canvas;

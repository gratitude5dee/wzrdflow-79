
import { useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection
} from 'reactflow';
import 'reactflow/dist/style.css';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: 'Input Node' },
    position: { x: 250, y: 0 },
    className: 'light'
  },
];

const initialEdges: Edge[] = [];

const Index = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge(connection, eds));
  }, [setEdges]);

  return (
    <div className="w-screen h-screen bg-zinc-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        className="bg-zinc-900"
        minZoom={0.2}
        maxZoom={4}
        defaultViewport={{ x: 0, y: 0, zoom: 1.5 }}
      >
        <Background className="bg-zinc-900" />
        <Controls className="fill-white stroke-white" />
        <MiniMap className="!bg-zinc-800 !rounded-lg" />
        <Panel position="top-left" className="bg-zinc-800/50 p-4 rounded-lg backdrop-blur">
          <h1 className="text-2xl font-bold text-white mb-2">Flow Canvas</h1>
          <p className="text-zinc-400">Start building your flow by dragging nodes</p>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default Index;

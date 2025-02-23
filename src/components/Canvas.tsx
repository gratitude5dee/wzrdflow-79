
import { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  Panel,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  Connection,
  addEdge,
} from 'reactflow';
import { useToast } from '@/components/ui/use-toast';
import CustomEdge from './CustomEdge';
import RightSidebar from './RightSidebar';
import { supabase } from '@/integrations/supabase/client';
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
  const { toast } = useToast();

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

  const saveWorkflow = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to save workflows",
          variant: "destructive"
        });
        return;
      }

      // Create or update workflow
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .upsert({
          name: 'My Workflow', // You might want to make this dynamic
          user_id: user.id,
        })
        .select()
        .single();

      if (workflowError || !workflow) throw workflowError;

      // Save nodes
      const nodesToSave = nodes.map(node => ({
        workflow_id: workflow.id,
        type: node.type || 'default',
        position_x: node.position.x,
        position_y: node.position.y,
        data: node.data,
        id: node.id
      }));

      const { error: nodesError } = await supabase
        .from('nodes')
        .upsert(nodesToSave);

      if (nodesError) throw nodesError;

      // Save edges
      const edgesToSave = edges.map(edge => ({
        workflow_id: workflow.id,
        source_node_id: edge.source,
        target_node_id: edge.target,
        data: edge.data || {},
        id: edge.id
      }));

      const { error: edgesError } = await supabase
        .from('edges')
        .upsert(edgesToSave);

      if (edgesError) throw edgesError;

      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error saving workflow",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadWorkflow = async (workflowId: string) => {
    try {
      // Fetch nodes
      const { data: nodesData, error: nodesError } = await supabase
        .from('nodes')
        .select('*')
        .eq('workflow_id', workflowId);

      if (nodesError) throw nodesError;

      // Fetch edges
      const { data: edgesData, error: edgesError } = await supabase
        .from('edges')
        .select('*')
        .eq('workflow_id', workflowId);

      if (edgesError) throw edgesError;

      // Transform nodes to ReactFlow format
      const flowNodes = nodesData.map((node) => ({
        id: node.id,
        type: node.type,
        position: { x: node.position_x, y: node.position_y },
        data: node.data,
      }));

      // Transform edges to ReactFlow format
      const flowEdges = edgesData.map((edge) => ({
        id: edge.id,
        source: edge.source_node_id,
        target: edge.target_node_id,
        type: 'custom',
        data: edge.data,
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);

      toast({
        title: "Success",
        description: "Workflow loaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error loading workflow",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Add a save button to the panel
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
          
          {/* Save/Load Controls */}
          <Panel position="top-left" className="bg-zinc-800/50 p-3 rounded-lg backdrop-blur">
            <div className="flex gap-2">
              <button
                onClick={saveWorkflow}
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Workflow
              </button>
              {/* Note: In a real app, you'd probably want to show a workflow selector */}
              <button
                onClick={() => loadWorkflow("your-workflow-id")}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Load Workflow
              </button>
            </div>
          </Panel>
          
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
          
          {/* MiniMap positioned in the sidebar area */}
          <Panel position="top-right" className="!absolute !right-[-256px] !top-auto !bottom-4 !w-56 !mx-4">
            <MiniMap 
              className="!bg-zinc-800 rounded-lg border border-zinc-700"
              maskColor="rgba(0, 0, 0, 0.5)"
              nodeColor="#525252"
              nodeStrokeColor="#404040"
              nodeBorderRadius={4}
              style={{ height: 120 }}
            />
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

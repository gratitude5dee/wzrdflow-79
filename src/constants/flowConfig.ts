
import { Node, Edge } from 'reactflow';

export const initialNodes: Node[] = [
  {
    id: 'fal-ai',
    type: 'default',
    data: { label: 'Fal AI' },
    position: { x: 400, y: 200 },
    style: {
      background: 'rgba(0, 0, 0, 0.8)',
      color: '#fff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '10px 20px',
    }
  }
];

export const initialEdges: Edge[] = [];

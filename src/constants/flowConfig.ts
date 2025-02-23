
import { Node, Edge } from 'reactflow';

export const initialNodes: Node[] = [
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

export const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'custom',
    data: { dashed: true },
  },
];

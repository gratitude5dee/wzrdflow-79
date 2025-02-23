
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const customStyle = {
    ...style,
    strokeWidth: 2,
    stroke: '#2DD4BF',
    strokeDasharray: data?.dashed ? '5,5' : 'none',
  };

  return (
    <BaseEdge 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={customStyle} 
    />
  );
};

export default CustomEdge;

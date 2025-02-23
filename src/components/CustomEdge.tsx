
import { BaseEdge, EdgeProps, getBezierPath } from 'reactflow';

const CustomEdge = ({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
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

  return (
    <>
      <BaseEdge 
        path={edgePath}
        style={{
          ...style,
          strokeWidth: 2,
          stroke: '#2DD4BF',
          strokeDasharray: data?.dashed ? '5,5' : 'none',
        }}
      />
    </>
  );
};

export default CustomEdge;


import { Panel } from 'reactflow';

interface FlowControlsProps {
  onSave: () => void;
  onLoad: (workflowId: string) => void;
}

const FlowControls = ({ onSave, onLoad }: FlowControlsProps) => {
  return (
    <>
      {/* Save/Load Controls */}
      <Panel position="top-left" className="bg-zinc-800/50 p-3 rounded-lg backdrop-blur">
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Save Workflow
          </button>
          <button
            onClick={() => onLoad("your-workflow-id")}
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
    </>
  );
};

export default FlowControls;

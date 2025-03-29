
import { type ProjectData } from './ProjectSetupWizard';

interface BreakdownTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const BreakdownTab = ({ projectData, updateProjectData }: BreakdownTabProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Breakdown</h1>
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <p className="text-zinc-400">Review and finalize your project details.</p>
        <p className="text-zinc-400 mt-4">This tab would provide a summary of all settings and choices made in previous tabs.</p>
      </div>
    </div>
  );
};

export default BreakdownTab;

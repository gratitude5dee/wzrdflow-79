
import { type ProjectData } from './ProjectSetupWizard';

interface SettingsTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const SettingsTab = ({ projectData, updateProjectData }: SettingsTabProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Settings & Cast</h1>
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <p className="text-zinc-400">Define the settings and cast for your project.</p>
        <p className="text-zinc-400 mt-4">This tab would include options for locations, time periods, and character details.</p>
      </div>
    </div>
  );
};

export default SettingsTab;


import { type ProjectData } from './ProjectSetupWizard';

interface StorylineTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const StorylineTab = ({ projectData, updateProjectData }: StorylineTabProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Storyline</h1>
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800">
        <p className="text-zinc-400">Build out your story structure and scenes here.</p>
        <p className="text-zinc-400 mt-4">This tab would include options for defining the narrative arc, characters, and key scenes.</p>
      </div>
    </div>
  );
};

export default StorylineTab;


import { Plus } from 'lucide-react';

interface NewProjectCardProps {
  onClick: () => void;
}

export const NewProjectCard = ({ onClick }: NewProjectCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
    >
      <div className="w-full aspect-video bg-zinc-800/50 flex items-center justify-center">
        <Plus className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
      </div>
      <div className="p-4">
        <h3 className="font-medium mb-2">Create a new project</h3>
      </div>
    </button>
  );
};

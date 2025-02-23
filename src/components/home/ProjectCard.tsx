
import { MoreVertical, Plus } from 'lucide-react';

export interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  lastEdited: string;
  isPrivate: boolean;
}

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
}

export const ProjectCard = ({ project, onOpen }: ProjectCardProps) => {
  return (
    <div className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all">
      {project.thumbnail ? (
        <img
          src={project.thumbnail}
          alt={project.name}
          className="w-full aspect-video object-cover"
        />
      ) : (
        <div className="w-full aspect-video bg-zinc-800 flex items-center justify-center">
          <Plus className="h-8 w-8 text-zinc-600" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{project.name}</h3>
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>{project.lastEdited}</span>
          <span className="px-2 py-1 bg-zinc-800 rounded text-xs">
            {project.isPrivate ? 'Private' : 'Public'}
          </span>
        </div>
      </div>
      <button
        onClick={() => onOpen(project.id)}
        className="absolute inset-0 w-full h-full opacity-0"
        aria-label={`Open ${project.name}`}
      />
    </div>
  );
};


import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Plus, Search, MoreVertical } from 'lucide-react';
import { useState } from 'react';

interface Project {
  id: string;
  name: string;
  thumbnail?: string;
  lastEdited: string;
  isPrivate: boolean;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'public'>('all');

  const [projects] = useState<Project[]>([
    {
      id: '1',
      name: 'World Builder',
      thumbnail: 'public/lovable-uploads/1e1aab33-e5d2-4ef2-b40d-84a2e2679e3c.png',
      lastEdited: 'No edits since creation',
      isPrivate: true,
    }
  ]);

  const handleCreateProject = () => {
    navigate('/');
  };

  const handleOpenProject = (projectId: string) => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-2">
                <img src="/logo.svg" alt="WZRD.tech" className="h-8 w-8" />
                <span className="font-semibold">WZRD.tech</span>
                <span className="px-1.5 py-0.5 text-[10px] bg-zinc-800 rounded text-zinc-400">BETA</span>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-64 bg-zinc-900 rounded-lg pl-10 pr-4 py-2 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <Button
              onClick={handleCreateProject}
              className="bg-white text-black hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              Create new project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-8">Your projects</h1>

        {/* Recent Projects */}
        <section className="mb-12">
          <h2 className="text-lg font-medium mb-4">Recents</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
              >
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
                  onClick={() => handleOpenProject(project.id)}
                  className="absolute inset-0 w-full h-full opacity-0"
                  aria-label={`Open ${project.name}`}
                />
              </div>
            ))}

            {/* Create New Project Card */}
            <button
              onClick={handleCreateProject}
              className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all"
            >
              <div className="w-full aspect-video bg-zinc-800/50 flex items-center justify-center">
                <Plus className="h-8 w-8 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
              </div>
              <div className="p-4">
                <h3 className="font-medium mb-2">Create a new project</h3>
              </div>
            </button>
          </div>
        </section>

        {/* All Projects */}
        <section>
          <div className="border-b border-zinc-800/50 mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 -mb-px ${
                  activeTab === 'all'
                    ? 'border-b-2 border-white font-medium'
                    : 'text-zinc-400'
                }`}
              >
                All Projects (3)
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`px-4 py-2 -mb-px ${
                  activeTab === 'private'
                    ? 'border-b-2 border-white font-medium'
                    : 'text-zinc-400'
                }`}
              >
                Private (3)
              </button>
              <button
                onClick={() => setActiveTab('public')}
                className={`px-4 py-2 -mb-px ${
                  activeTab === 'public'
                    ? 'border-b-2 border-white font-medium'
                    : 'text-zinc-400'
                }`}
              >
                Public (0)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800/50 hover:border-zinc-700/50 transition-all p-4"
              >
                <div className="flex items-center gap-4">
                  {project.thumbnail ? (
                    <img
                      src={project.thumbnail}
                      alt={project.name}
                      className="w-32 aspect-video object-cover rounded"
                    />
                  ) : (
                    <div className="w-32 aspect-video bg-zinc-800 flex items-center justify-center rounded">
                      <Plus className="h-6 w-6 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1">
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
                </div>
                <button
                  onClick={() => handleOpenProject(project.id)}
                  className="absolute inset-0 w-full h-full opacity-0"
                  aria-label={`Open ${project.name}`}
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Home;

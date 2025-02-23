
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/home/Header';
import { ViewModeSelector } from '@/components/home/ViewModeSelector';
import { ProjectList } from '@/components/home/ProjectList';
import type { Project } from '@/components/home/ProjectCard';

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'private' | 'public'>('all');
  const [viewMode, setViewMode] = useState<'studio' | 'storyboard' | 'editor'>('studio');

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
    navigate('/editor');
  };

  const handleOpenProject = (projectId: string) => {
    navigate('/editor');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Your projects</h1>
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {/* Recent Projects */}
        <section className="mb-12">
          <h2 className="text-lg font-medium mb-4">Recents</h2>
          <ProjectList
            projects={projects}
            onOpenProject={handleOpenProject}
            onCreateProject={handleCreateProject}
          />
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

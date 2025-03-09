
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const navigate = useNavigate();

  const handleCreateProject = () => {
    navigate('/editor');
  };

  return (
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
  );
};

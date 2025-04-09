
import { Share, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';

const StudioHeader = () => {
  return (
    <header className="w-full bg-black border-b border-zinc-800/50 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Logo size="sm" showVersion={false} />
        <h1 className="text-lg font-medium text-white">Untitled</h1>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" className="text-white hover:bg-zinc-800">
          <User className="h-5 w-5 mr-2" />
        </Button>
        <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </div>
    </header>
  );
};

export default StudioHeader;

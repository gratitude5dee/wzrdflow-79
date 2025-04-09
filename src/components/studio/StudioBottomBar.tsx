
import { Minus, Plus, ZoomIn, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StudioBottomBar = () => {
  return (
    <div className="w-full bg-black border-t border-zinc-800/50 px-6 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <Minus className="h-4 w-4" />
        </Button>
        <span className="text-zinc-400 text-sm">1:1</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
          <Maximize className="h-4 w-4" />
        </Button>
        <span className="text-zinc-600 text-xs ml-2">2K</span>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" className="text-zinc-400 hover:text-white">
          Tasks <span className="ml-1 text-zinc-600">0 active</span>
        </Button>
        <span className="text-zinc-600">›</span>
      </div>
    </div>
  );
};

export default StudioBottomBar;

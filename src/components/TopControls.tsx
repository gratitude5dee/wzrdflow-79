
import { Share2, HelpCircle, Play } from 'lucide-react';

const TopControls = () => {
  return (
    <div className="absolute top-4 right-4 flex items-center space-x-2">
      <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-white rounded-lg text-sm transition-colors">
        <Share2 className="h-4 w-4" />
        Share
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-700/50 text-white rounded-lg text-sm transition-colors">
        <Play className="h-4 w-4" />
        Run
      </button>
      <button className="p-2 text-zinc-400 hover:text-zinc-300 transition-colors">
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TopControls;

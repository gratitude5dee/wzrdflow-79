
import { Flower, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="w-full bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 shadow-lg">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Flower className="w-6 h-6 text-teal-500" />
            <h1 className="text-2xl font-bold text-white tracking-tight">FLORA ALPHA</h1>
          </div>
          <span className="text-sm text-zinc-400 mt-1">Starting Project 001</span>
        </div>
        <button className="text-white hover:text-teal-500 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;


import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  name: string;
  isUpcoming?: boolean;
}

interface Category {
  name: string;
  items: MenuItem[];
}

const WorldBuilderSidebar = () => {
  const categories: Category[] = [
    {
      name: 'SOURCES',
      items: [
        { name: 'Image Upload' },
        { name: 'Video Upload' },
        { name: 'Camera' },
        { name: 'Screen Share' },
        { name: 'Drawing' },
        { name: 'Text to Image' },
        { name: 'Text to Text' },
        { name: 'Text to Video' },
        { name: 'Text to Audio', isUpcoming: true },
      ],
    },
  ];

  return (
    <div className="w-64 h-screen bg-[#0C0C0C] text-white flex flex-col">
      <div className="p-4">
        <h2 className="text-lg font-bold">World Builder</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800/50 focus:outline-none focus:border-zinc-700/50 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {categories.map((category) => (
          <div key={category.name} className="mt-4">
            <h3 className="text-[11px] font-medium tracking-wider text-zinc-500 px-2">
              {category.name}
            </h3>
            <div className="mt-2 space-y-0.5">
              {category.items.map((item) => (
                <button
                  key={item.name}
                  className={`w-full flex items-center justify-between p-2 text-[13px] rounded-lg transition-colors group
                    ${item.isUpcoming ? 'text-zinc-500' : 'text-zinc-300 hover:bg-white/[0.04]'}`}
                >
                  <span className="flex items-center gap-2">
                    {item.name}
                    {item.isUpcoming && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-950/50 text-emerald-400 rounded">
                        Upcoming
                      </span>
                    )}
                  </span>
                  {!item.isUpcoming && (
                    <Plus className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-sm">Free</span>
          <span className="text-zinc-500 text-sm flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
            8k
          </span>
        </div>
      </div>
    </div>
  );
};

export default WorldBuilderSidebar;

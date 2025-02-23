
import { Search, ChevronDown, Plus } from 'lucide-react';
import { useState } from 'react';

interface MenuItem {
  name: string;
  icon?: React.ReactNode;
  isUpcoming?: boolean;
}

interface Category {
  name: string;
  isExpanded: boolean;
  items: MenuItem[];
}

const LeftSidebar = () => {
  const [categories, setCategories] = useState<Category[]>([
    {
      name: 'SOURCES',
      isExpanded: true,
      items: [
        { name: 'Image Upload' },
        { name: 'Video Upload' },
        { name: 'Camera' },
        { name: 'Screen Share' },
        { name: 'Drawing' },
      ],
    },
    {
      name: 'TEXT',
      isExpanded: true,
      items: [
        { name: 'Text to Image' },
        { name: 'Text to Text' },
        { name: 'Text to Video' },
        { name: 'Text to Audio', isUpcoming: true },
      ],
    },
    {
      name: 'IMAGE',
      isExpanded: true,
      items: [
        { name: 'Images to Video' },
        { name: 'Image Variations' },
        { name: 'Image to Image' },
        { name: 'Inpainting' },
        { name: 'Image Upscaler' },
        { name: 'Image to Text' },
        { name: 'Image to Video' },
      ],
    },
    {
      name: 'VIDEO',
      isExpanded: true,
      items: [
        { name: 'Video to Video' },
      ],
    },
    {
      name: 'REALTIME',
      isExpanded: true,
      items: [
        { name: 'Realtime' },
      ],
    },
    {
      name: 'UTILITIES',
      isExpanded: true,
      items: [
        { name: 'Flora Out' },
        { name: 'Video Editor', isUpcoming: true },
        { name: 'Relight', isUpcoming: true },
      ],
    },
  ]);

  const toggleCategory = (index: number) => {
    setCategories(categories.map((cat, i) => 
      i === index ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  return (
    <div className="w-64 h-screen bg-[#141414] border-r border-zinc-800 flex flex-col">
      {/* Search Section */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 overflow-y-auto space-y-2 px-2">
        {categories.map((category, index) => (
          <div key={category.name} className="text-white">
            <button
              onClick={() => toggleCategory(index)}
              className="w-full flex items-center justify-between p-2 text-xs font-semibold text-zinc-400 hover:text-zinc-300"
            >
              <span>{category.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${category.isExpanded ? 'rotate-180' : ''}`} />
            </button>
            {category.isExpanded && (
              <div className="space-y-1 mt-1">
                {category.items.map((item) => (
                  <button
                    key={item.name}
                    className="w-full flex items-center justify-between p-2 text-sm text-zinc-300 hover:bg-zinc-800/50 rounded-lg transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {item.isUpcoming && (
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-950 text-emerald-400 rounded">
                          Upcoming
                        </span>
                      )}
                    </span>
                    <Plus className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Free</span>
          <span className="text-zinc-400 text-sm flex items-center gap-1">
            <span className="size-1.5 bg-emerald-400 rounded-full"></span>
            1k
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

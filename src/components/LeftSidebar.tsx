import { Search, ChevronDown, Plus, Camera } from 'lucide-react';
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
      isExpanded: false,
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
      isExpanded: false,
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
      isExpanded: false,
      items: [
        { name: 'Video to Video' },
      ],
    },
    {
      name: 'REALTIME',
      isExpanded: false,
      items: [
        { name: 'Realtime' },
      ],
    },
    {
      name: 'UTILITIES',
      isExpanded: false,
      items: [
        { name: 'Flora Out' },
        { name: 'Video Editor', isUpcoming: true },
        { name: 'Relight', isUpcoming: true },
      ],
    },
  ]);

  const addImagesToVideoNode = () => {
    const newNode = {
      id: `images-to-video-${Date.now()}`,
      type: 'imagesToVideo',
      position: { x: 250, y: 100 },
      data: { label: 'Images to Video' },
    };
    
    console.log('Adding Images to Video node:', newNode);
  };

  const toggleCategory = (index: number) => {
    setCategories(categories.map((cat, i) => 
      i === index ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  return (
    <div className="w-64 h-screen bg-[#0C0C0C] border-r border-zinc-800/50 flex flex-col">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-[#141414] text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-800/50 focus:outline-none focus:border-zinc-700/50 transition-colors text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 px-1.5">
        {categories.map((category, index) => (
          <div key={category.name}>
            <button
              onClick={() => toggleCategory(index)}
              className="w-full flex items-center justify-between p-2 text-[11px] font-medium tracking-wider text-zinc-500 hover:text-zinc-400"
            >
              <span>{category.name}</span>
              <ChevronDown 
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  category.isExpanded ? 'rotate-180' : ''
                }`} 
              />
            </button>
            {category.isExpanded && (
              <div className="space-y-0.5 mt-0.5 mb-2">
                {category.items.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => item.name === 'Images to Video' && addImagesToVideoNode()}
                    className="w-full flex items-center justify-between p-2 text-[13px] text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors group"
                  >
                    <span className="flex items-center gap-2">
                      {item.name}
                      {item.isUpcoming && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-950/50 text-emerald-400 rounded">
                          Upcoming
                        </span>
                      )}
                    </span>
                    <Plus className="h-3.5 w-3.5 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-3 py-2 border-t border-zinc-800/50">
        <button className="w-full flex items-center gap-2 p-2 text-[13px] text-zinc-300 hover:bg-white/[0.04] rounded-lg transition-colors">
          <Camera className="h-4 w-4 text-zinc-500" />
          MacBook Pro Camera
        </button>
      </div>

      <div className="p-3 border-t border-zinc-800/50">
        <div className="flex items-center justify-between">
          <span className="text-zinc-500 text-sm">Free</span>
          <span className="text-zinc-500 text-sm flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
            1k
          </span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

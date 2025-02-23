
import { Search, Plus } from 'lucide-react';
import { useState } from 'react';

interface Category {
  name: string;
  isExpanded: boolean;
}

const LeftSidebar = () => {
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Image Upload', isExpanded: false },
    { name: 'Text to Image', isExpanded: false },
    { name: 'Images to Video', isExpanded: false },
  ]);

  const toggleCategory = (index: number) => {
    setCategories(categories.map((cat, i) => 
      i === index ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  return (
    <div className="w-64 h-screen bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Search Section */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-zinc-800/50 text-white pl-10 pr-4 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories Section */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-zinc-400 mb-3">SOURCES</h2>
          <div className="space-y-2">
            {categories.map((category, index) => (
              <div key={category.name} className="text-white">
                <button
                  onClick={() => toggleCategory(index)}
                  className="w-full flex items-center justify-between p-2 hover:bg-zinc-800/50 rounded-lg group transition-colors"
                >
                  <span>{category.name}</span>
                  <Plus className={`h-4 w-4 text-zinc-400 group-hover:text-teal-500 transition-colors ${category.isExpanded ? 'rotate-45' : ''}`} />
                </button>
                {category.isExpanded && (
                  <div className="pl-4 mt-2 space-y-2">
                    <button className="w-full text-left text-zinc-400 hover:text-white p-2 hover:bg-zinc-800/50 rounded-lg transition-colors">
                      Add New
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center justify-between">
          <span className="text-zinc-400 text-sm">Free</span>
          <span className="text-zinc-400 text-sm">8 1k</span>
        </div>
      </div>
    </div>
  );
};

export default LeftSidebar;

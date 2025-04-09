import { useState } from 'react';
import { 
  Plus, History, Layers, Inbox, MessageCircle, Settings, HelpCircle, 
  Type, Image as ImageIcon, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudioSidebarProps {
  onAddBlock: (blockType: 'text' | 'image' | 'video') => void;
}

const StudioSidebar = ({ onAddBlock }: StudioSidebarProps) => {
  const [showAddMenu, setShowAddMenu] = useState(false);

  return (
    <div className="h-full w-16 bg-black border-r border-zinc-800/50 flex flex-col">
      <div className="flex-1 flex flex-col items-center pt-4 gap-6">
        {/* Add Button with Dropdown */}
        <div className="relative">
          <button 
            className="w-10 h-10 bg-zinc-900 hover:bg-zinc-800 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
          
          <AnimatePresence>
            {showAddMenu && (
              <motion.div 
                className="absolute left-14 top-0 w-64 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="p-2">
                  <h3 className="text-xs font-semibold text-zinc-500 px-3 py-2">ADD BLOCK</h3>
                  
                  <button 
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-md text-white text-sm"
                    onClick={() => {
                      onAddBlock('text');
                      setShowAddMenu(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800 w-7 h-7 rounded-full flex items-center justify-center">
                        <Type className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Text</span>
                    </div>
                    <span className="text-xs text-zinc-500">T</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-md text-white text-sm"
                    onClick={() => {
                      onAddBlock('image');
                      setShowAddMenu(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800 w-7 h-7 rounded-full flex items-center justify-center">
                        <ImageIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Image</span>
                    </div>
                    <span className="text-xs text-zinc-500">I</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-md text-white text-sm"
                    onClick={() => {
                      onAddBlock('video');
                      setShowAddMenu(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-zinc-800 w-7 h-7 rounded-full flex items-center justify-center">
                        <Video className="h-3.5 w-3.5 text-white" />
                      </div>
                      <span>Video</span>
                    </div>
                    <span className="text-xs text-zinc-500">V</span>
                  </button>
                  
                  <div className="border-t border-zinc-800 my-1"></div>
                  
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-md text-white text-sm">
                    <div className="flex items-center gap-3">
                      <span>Navigate / Select</span>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-zinc-800 rounded-md text-white text-sm">
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
                      <span>Learn about Blocks</span>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Other sidebar icons */}
        <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
          <Layers className="h-5 w-5" />
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
          <History className="h-5 w-5" />
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
          <Inbox className="h-5 w-5" />
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
          <MessageCircle className="h-5 w-5" />
        </button>
        
        <button className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors">
          <Settings className="h-5 w-5" />
        </button>
      </div>
      
      {/* Bottom logo */}
      <div className="p-3 flex justify-center mb-4">
        <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center">
          <img src="/lovable-uploads/075616c6-e4fc-4662-a4b8-68b746782b65.png" alt="Logo" className="w-8 h-8" />
        </div>
      </div>
    </div>
  );
};

export default StudioSidebar;


import React from 'react';
import { HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BlockProps {
  id: string;
  type: 'text' | 'image' | 'video';
  title: string;
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
}

const BlockBase: React.FC<BlockProps> = ({ 
  id, 
  type, 
  title, 
  children, 
  onSelect,
  isSelected 
}) => {
  return (
    <motion.div
      className={`w-full min-h-[16rem] rounded-lg bg-zinc-900 border ${isSelected ? 'border-blue-500' : 'border-zinc-800'} 
                  overflow-hidden shadow-md mb-4`}
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-400">{title}</h3>
        <button className="text-zinc-500 hover:text-zinc-300">
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
      
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
};

export default BlockBase;

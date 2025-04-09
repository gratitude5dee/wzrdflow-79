
import React, { useState } from 'react';
import { HelpCircle, History, Image, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface BlockProps {
  id: string;
  type: 'text' | 'image' | 'video';
  title: string;
  children: React.ReactNode;
  onSelect: () => void;
  isSelected: boolean;
  generationTime?: string;
  supportsConnections?: boolean;
  connectionPoints?: Array<{
    id: string;
    type: 'input' | 'output';
    label: string;
    position: 'top' | 'right' | 'bottom' | 'left';
  }>;
  onShowHistory?: () => void;
}

const BlockBase: React.FC<BlockProps> = ({ 
  id, 
  type, 
  title, 
  children, 
  onSelect,
  isSelected,
  generationTime,
  supportsConnections = false,
  connectionPoints = [],
  onShowHistory
}) => {
  const [showConnections, setShowConnections] = useState(false);

  return (
    <motion.div
      className={`w-full min-h-[16rem] rounded-lg bg-zinc-900 border ${isSelected ? 'border-blue-500' : 'border-zinc-800'} 
                  overflow-hidden shadow-md mb-4 relative`}
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
      onMouseEnter={() => supportsConnections && setShowConnections(true)}
      onMouseLeave={() => supportsConnections && setShowConnections(false)}
    >
      <div className="bg-zinc-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="text-xs font-semibold text-zinc-400">{title}</h3>
          {generationTime && (
            <div className="ml-2 flex items-center text-xs text-zinc-500">
              <Clock className="h-3 w-3 mr-1" />
              {generationTime}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onShowHistory && (
            <button 
              className="text-zinc-500 hover:text-zinc-300"
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory();
              }}
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button className="text-zinc-500 hover:text-zinc-300">
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {children}
      </div>
      
      {/* Connection Points */}
      {supportsConnections && showConnections && connectionPoints.map(point => {
        let positionClasses = '';
        
        switch(point.position) {
          case 'top':
            positionClasses = 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
          case 'right':
            positionClasses = 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2';
            break;
          case 'bottom':
            positionClasses = 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2';
            break;
          case 'left':
            positionClasses = 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2';
            break;
        }
        
        return (
          <div 
            key={point.id}
            className={cn(
              "absolute w-3 h-3 bg-zinc-700 border border-zinc-600 rounded-full z-10 cursor-pointer",
              positionClasses,
              point.type === 'input' ? 'hover:bg-blue-500' : 'hover:bg-green-500'
            )}
            title={point.label}
          />
        );
      })}
    </motion.div>
  );
};

export default BlockBase;

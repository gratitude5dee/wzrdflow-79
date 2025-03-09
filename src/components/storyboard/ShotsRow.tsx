
import React, { useState } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ShotCard from './ShotCard';

interface ShotsRowProps {
  sceneNumber: number;
}

const ShotsRow = ({ sceneNumber }: ShotsRowProps) => {
  // Initial shot items
  const [shots, setShots] = useState([
    { id: `scene-${sceneNumber}-shot-1`, number: 1 },
    { id: `scene-${sceneNumber}-shot-2`, number: 2 },
    { id: `scene-${sceneNumber}-shot-3`, number: 3 }
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setShots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addShot = () => {
    const newShotNumber = shots.length + 1;
    setShots([
      ...shots,
      { id: `scene-${sceneNumber}-shot-${newShotNumber}`, number: newShotNumber }
    ]);
  };

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#FFB628] glow-text-gold font-serif">SCENE {sceneNumber}</h2>
        <Button 
          onClick={addShot}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Shot
        </Button>
      </div>

      <ScrollArea className="pb-4">
        <div className="flex space-x-6 pb-4 px-2">
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            <SortableContext items={shots.map(shot => shot.id)} strategy={horizontalListSortingStrategy}>
              <AnimatePresence>
                {shots.map((shot) => (
                  <ShotCard
                    key={shot.id}
                    id={shot.id}
                    shotNumber={shot.number}
                  />
                ))}
              </AnimatePresence>
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ShotsRow;

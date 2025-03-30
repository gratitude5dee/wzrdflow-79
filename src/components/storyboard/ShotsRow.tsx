
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ShotCard from './ShotCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';

interface ShotsRowProps {
  sceneId: string;
  sceneNumber: number;
  projectId: string;
  onSceneDelete?: (sceneId: string) => void;
  isSelected?: boolean;
}

const ShotsRow = ({ sceneId, sceneNumber, projectId, onSceneDelete, isSelected = false }: ShotsRowProps) => {
  const [shots, setShots] = useState<ShotDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Fetch shots for this scene
  useEffect(() => {
    const fetchShots = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('shots')
          .select('*')
          .eq('scene_id', sceneId)
          .order('shot_number', { ascending: true });
        
        if (error) throw error;
        setShots(data as ShotDetails[]);
      } catch (error: any) {
        console.error("Error fetching shots:", error);
        toast.error(`Failed to load shots: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShots();
  }, [sceneId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setIsSavingOrder(true);
      try {
        // Update shots array locally
        setShots((items) => {
          const oldIndex = items.findIndex((item) => item.id === active.id);
          const newIndex = items.findIndex((item) => item.id === over.id);
          
          const reorderedItems = arrayMove(items, oldIndex, newIndex);
          
          // Update shot_number for all affected items
          return reorderedItems.map((item, index) => ({
            ...item,
            shot_number: index + 1
          }));
        });

        // After state update, save the new order to the database
        const updatedShots = shots.map((shot, index) => ({
          id: shot.id,
          shot_number: index + 1
        }));

        // Use Promise.all to update all shots in parallel
        await Promise.all(
          updatedShots.map(shot => 
            supabase
              .from('shots')
              .update({ shot_number: shot.shot_number })
              .eq('id', shot.id)
          )
        );
      } catch (error: any) {
        console.error("Error updating shot order:", error);
        toast.error(`Failed to save shot order: ${error.message}`);
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  const addShot = async () => {
    try {
      const newShotNumber = shots.length > 0 
        ? Math.max(...shots.map(s => s.shot_number)) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from('shots')
        .insert({
          scene_id: sceneId,
          project_id: projectId,
          shot_number: newShotNumber,
          shot_type: 'medium', // Default shot type
          prompt_idea: '',
          image_status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setShots(prev => [...prev, data as ShotDetails]);
      toast.success('Shot added');
    } catch (error: any) {
      console.error("Error adding shot:", error);
      toast.error(`Failed to add shot: ${error.message}`);
    }
  };

  const handleDeleteShot = async (shotId: string) => {
    try {
      const { error } = await supabase
        .from('shots')
        .delete()
        .eq('id', shotId);
      
      if (error) throw error;
      
      setShots(shots.filter(shot => shot.id !== shotId));
      toast.success('Shot deleted');
    } catch (error: any) {
      console.error("Error deleting shot:", error);
      toast.error(`Failed to delete shot: ${error.message}`);
    }
  };

  const handleDeleteScene = async () => {
    if (!onSceneDelete) return;
    
    if (window.confirm(`Are you sure you want to delete Scene ${sceneNumber}? This will also delete all shots in this scene.`)) {
      setIsDeleting(true);
      try {
        await onSceneDelete(sceneId);
      } catch (error) {
        setIsDeleting(false);
      }
    }
  };

  const handleShotUpdate = async (shotId: string, updates: Partial<ShotDetails>) => {
    try {
      const { error } = await supabase
        .from('shots')
        .update(updates)
        .eq('id', shotId);
      
      if (error) throw error;
      
      // Update local state
      setShots(shots.map(shot => 
        shot.id === shotId ? { ...shot, ...updates } : shot
      ));
    } catch (error: any) {
      console.error("Error updating shot:", error);
      toast.error(`Failed to update shot: ${error.message}`);
    }
  };

  return (
    <div className={`p-4 rounded-lg transition-all duration-300 ${isSelected ? 'bg-[#111827]/50 ring-1 ring-purple-500/30' : 'hover:bg-[#111827]/30'}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#FFB628] glow-text-gold font-serif cursor-pointer hover:opacity-80">
          SCENE {sceneNumber}
        </h2>
        <div className="flex space-x-2">
          <Button 
            onClick={addShot}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
            disabled={isLoading || isSavingOrder}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shot
          </Button>
          
          {onSceneDelete && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="destructive" 
                    size="icon"
                    disabled={isDeleting}
                    onClick={handleDeleteScene}
                  >
                    {isDeleting ? (
                      <span className="animate-spin">◌</span>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete scene and all its shots</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>

      <ScrollArea className="pb-4">
        <div className="flex space-x-6 pb-4 px-2 min-h-[180px]">
          {isLoading ? (
            <div className="flex items-center justify-center w-full text-zinc-500">
              <span className="animate-spin mr-2">◌</span> Loading shots...
            </div>
          ) : shots.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full text-zinc-500">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <p>No shots in this scene yet.</p>
              <Button 
                variant="ghost" 
                className="mt-2 text-zinc-400 hover:text-white"
                onClick={addShot}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add your first shot
              </Button>
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={shots.map(shot => shot.id)} strategy={horizontalListSortingStrategy}>
                <AnimatePresence>
                  {shots.map((shot) => (
                    <ShotCard
                      key={shot.id}
                      shot={shot}
                      onUpdate={(updates) => handleShotUpdate(shot.id, updates)}
                      onDelete={() => handleDeleteShot(shot.id)}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ShotsRow;

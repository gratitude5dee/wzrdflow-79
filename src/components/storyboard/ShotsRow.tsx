
import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, RefreshCw } from 'lucide-react';
import ShotCard from './ShotCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShotDetails } from '@/types/storyboardTypes';

interface ShotsRowProps {
  sceneId: string;
  sceneNumber: number;
}

const ShotsRow = ({ sceneId, sceneNumber }: ShotsRowProps) => {
  const [shots, setShots] = useState<ShotDetails[]>([]);
  const [isLoadingShots, setIsLoadingShots] = useState(true);

  // Fetch shots when sceneId changes
  useEffect(() => {
    const fetchShots = async () => {
      if (!sceneId) return;
      setIsLoadingShots(true);
      try {
        const { data, error } = await supabase
          .from('shots')
          .select('*')
          .eq('scene_id', sceneId)
          .order('shot_number', { ascending: true });

        if (error) throw error;
        setShots(data || []);
      } catch (error: any) {
        console.error(`Error fetching shots for scene ${sceneId}:`, error);
        toast.error(`Failed to load shots for Scene ${sceneNumber}.`);
        setShots([]); // Clear on error
      } finally {
        setIsLoadingShots(false);
      }
    };
    
    fetchShots();
    
    // Set up real-time subscription for shot updates
    const shotsSubscription = supabase
      .channel(`shots-${sceneId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'shots',
          filter: `scene_id=eq.${sceneId}`
        }, 
        (payload) => {
          console.log('Shots change received:', payload);
          fetchShots(); // Refetch shots when changes occur
        }
      )
      .subscribe();
      
    return () => {
      shotsSubscription.unsubscribe();
    };
  }, [sceneId, sceneNumber]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setShots((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const movedArray = arrayMove(items, oldIndex, newIndex);
        
        // Update shot numbers in DB based on new order
        updateShotOrderInDb(movedArray);
        
        return movedArray;
      });
    }
  };
  
  const updateShotOrderInDb = async (updatedShots: ShotDetails[]) => {
    try {
      // Create batch updates with new shot_number values
      const updates = updatedShots.map((shot, index) => ({
        id: shot.id,
        shot_number: index + 1
      }));
      
      // Update each shot's shot_number in sequence
      for (const update of updates) {
        const { error } = await supabase
          .from('shots')
          .update({ shot_number: update.shot_number })
          .eq('id', update.id);
          
        if (error) {
          console.error(`Error updating shot order for ${update.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error updating shot order:', error);
      toast.error('Failed to save new shot order.');
    }
  };

  const generateShots = async () => {
    if (!sceneId) return;
    
    try {
      toast.info("Generating shots for this scene...");
      
      // Call the edge function directly
      const { error } = await supabase.functions.invoke('generate-shots-for-scene', {
        body: { 
          scene_id: sceneId,
          project_id: shots[0]?.project_id || '' // Get project_id from an existing shot if available
        }
      });
      
      if (error) throw error;
      
      toast.success("Shot generation has started. New shots will appear soon.");
    } catch (error: any) {
      console.error('Error triggering shot generation:', error);
      toast.error(`Failed to generate shots: ${error.message}`);
    }
  };

  const addShotManual = async () => {
    if (!sceneId || shots.length === 0 && !shots[0]?.project_id) {
      toast.error("Cannot add shot - missing scene or project information");
      return;
    }
    
    try {
      const newShotNumber = shots.length > 0 
        ? Math.max(...shots.map(s => s.shot_number)) + 1 
        : 1;
        
      const { data, error } = await supabase
        .from('shots')
        .insert({
          scene_id: sceneId,
          project_id: shots[0]?.project_id || '',
          shot_number: newShotNumber,
          shot_type: 'Medium Shot',
          prompt_idea: 'New shot - add details',
          image_status: 'pending'
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        toast.success(`Shot ${newShotNumber} added.`);
        // The real-time subscription should update the list automatically
      }
    } catch (error: any) {
      console.error('Error adding shot:', error);
      toast.error(`Failed to add shot: ${error.message}`);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-[#FFB628] glow-text-gold font-serif cursor-pointer hover:opacity-80">
          SCENE {sceneNumber}
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={generateShots}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-glow-indigo"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Generate Shots
          </Button>
          <Button
            onClick={addShotManual}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow-purple"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Shot
          </Button>
        </div>
      </div>
      <ScrollArea className="pb-4">
        <div className="flex space-x-6 pb-4 px-2 min-h-[280px]">
          {isLoadingShots ? (
            <div className="flex items-center justify-center w-full">
              <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
              <span className="ml-2 text-zinc-400">Loading shots...</span>
            </div>
          ) : shots.length === 0 ? (
            <div className="flex items-center justify-center w-full text-zinc-500">
              No shots for this scene yet. Generate or add shots to get started.
            </div>
          ) : (
            <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              <SortableContext items={shots.map(shot => shot.id)} strategy={horizontalListSortingStrategy}>
                <AnimatePresence>
                  {shots.map((shot) => (
                    <ShotCard
                      key={shot.id}
                      id={shot.id}
                      shot={shot}
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

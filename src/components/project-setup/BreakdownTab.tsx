
import { type ProjectData } from './types';
import { Button } from '@/components/ui/button';
import { Plus, X, Info, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { SceneEditDialog, type Scene } from './SceneEditDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useProject } from './ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BreakdownTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const BreakdownTab = ({ projectData, updateProjectData }: BreakdownTabProps) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showNoScenesAlert, setShowNoScenesAlert] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const { projectId } = useProject();

  // Fetch scenes from Supabase
  useEffect(() => {
    const fetchScenes = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .order('scene_number', { ascending: true });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform the data to match our Scene type
          const mappedScenes: Scene[] = data.map(scene => ({
            id: scene.id,
            number: scene.scene_number,
            title: scene.title || `Scene ${scene.scene_number}`,
            description: scene.description || "",
            sceneDescription: scene.description || "",
            voiceover: scene.voiceover || "",
            location: scene.location || "",
            lighting: scene.lighting || "",
            weather: scene.weather || ""
          }));
          setScenes(mappedScenes);
          setShowNoScenesAlert(false);
        }
      } catch (error) {
        console.error('Error fetching scenes:', error);
        toast.error('Failed to load scenes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScenes();
  }, [projectId]);

  const handleNewScene = async () => {
    if (!projectId) {
      toast.error("Please save the project first");
      return;
    }

    const newSceneNumber = scenes.length > 0 
      ? Math.max(...scenes.map(s => (typeof s.number === 'number' ? s.number : 0))) + 1 
      : 1;
    
    try {
      // Insert new scene into database
      const { data, error } = await supabase
        .from('scenes')
        .insert({
          project_id: projectId,
          scene_number: newSceneNumber,
          title: `Scene ${newSceneNumber}`
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const newScene: Scene = {
        id: data.id,
        number: data.scene_number,
        title: data.title || `Scene ${data.scene_number}`,
        description: data.description || "",
        sceneDescription: data.description || "",
        voiceover: data.voiceover || "",
        location: data.location || "",
        lighting: data.lighting || "",
        weather: data.weather || ""
      };
      
      setScenes([...scenes, newScene]);
      setEditingScene(newScene);
      setShowNoScenesAlert(false);
      
    } catch (error) {
      console.error('Error creating scene:', error);
      toast.error('Failed to create new scene');
    }
  };

  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
  };

  const handleDeleteScene = async (sceneId: string) => {
    if (!confirm('Are you sure you want to delete this scene?')) return;
    
    try {
      const { error } = await supabase
        .from('scenes')
        .delete()
        .eq('id', sceneId);
        
      if (error) throw error;
      
      setScenes(scenes.filter(s => s.id !== sceneId));
      toast.success('Scene deleted');
      
    } catch (error) {
      console.error('Error deleting scene:', error);
      toast.error('Failed to delete scene');
    }
  };

  const handleSaveScene = async (updatedScene: Scene) => {
    try {
      // Update scene in database
      const { error } = await supabase
        .from('scenes')
        .update({
          title: updatedScene.title,
          description: updatedScene.sceneDescription,
          location: updatedScene.location,
          lighting: updatedScene.lighting,
          weather: updatedScene.weather,
          voiceover: updatedScene.voiceover
        })
        .eq('id', updatedScene.id);
        
      if (error) throw error;
      
      // Update local state
      setScenes(scenes.map(s => s.id === updatedScene.id ? updatedScene : s));
      setEditingScene(null);
      toast.success('Scene updated');
      
    } catch (error) {
      console.error('Error updating scene:', error);
      toast.error('Failed to update scene');
    }
  };

  const handleDismissAlert = () => {
    setShowNoScenesAlert(false);
  };

  // Render a scene card
  const SceneCard = ({ scene }: { scene: Scene }) => (
    <div className="bg-[#111319] rounded-lg border border-zinc-800 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold">{scene.title}</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-800"
            onClick={() => handleEditScene(scene)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 hover:bg-zinc-800"
            onClick={() => handleDeleteScene(scene.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {scene.sceneDescription && (
        <div className="text-sm text-zinc-400 mb-2">
          {scene.sceneDescription.substring(0, 150)}
          {scene.sceneDescription.length > 150 ? '...' : ''}
        </div>
      )}
      
      <div className="grid grid-cols-3 gap-2 text-xs mt-4">
        {scene.location && (
          <div className="text-zinc-500">
            <span className="block font-medium uppercase mb-1">Location</span>
            <span className="text-zinc-300">{scene.location}</span>
          </div>
        )}
        {scene.lighting && (
          <div className="text-zinc-500">
            <span className="block font-medium uppercase mb-1">Lighting</span>
            <span className="text-zinc-300">{scene.lighting}</span>
          </div>
        )}
        {scene.weather && (
          <div className="text-zinc-500">
            <span className="block font-medium uppercase mb-1">Weather</span>
            <span className="text-zinc-300">{scene.weather}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-full p-6">
      <h1 className="text-2xl font-bold mb-8">Breakdown</h1>
      
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-pulse text-zinc-500">Loading scenes...</div>
        </div>
      ) : (
        <>
          {showNoScenesAlert && scenes.length === 0 && (
            <Alert className="mb-6 bg-[#080D20] border-none text-white">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
                <AlertDescription className="text-zinc-300">
                  No scenes yet. Add scenes to break down your story into filmable units. Provide location, lighting, and other details to better visualize each scene.
                </AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-2 h-6 w-6 p-0 rounded-full" 
                onClick={handleDismissAlert}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
          
          {scenes.length === 0 ? (
            <div className="flex justify-center items-center min-h-[400px] bg-[#111319] rounded-lg border border-zinc-800">
              <div 
                onClick={handleNewScene}
                className="flex flex-col items-center justify-center cursor-pointer text-zinc-400 hover:text-zinc-300 transition-colors"
              >
                <Plus className="h-10 w-10 mb-2" />
                <p>Add a scene</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {scenes.map(scene => (
                <SceneCard key={scene.id} scene={scene} />
              ))}
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleNewScene}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New scene
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {editingScene && (
        <SceneEditDialog
          scene={editingScene}
          open={true}
          onOpenChange={(open) => !open && setEditingScene(null)}
          onSave={handleSaveScene}
        />
      )}
    </div>
  );
};

export default BreakdownTab;


import { type ProjectData } from './ProjectSetupWizard';
import { Button } from '@/components/ui/button';
import { Plus, X, Info } from 'lucide-react';
import { useState } from 'react';
import { SceneEditDialog, type Scene } from './SceneEditDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface BreakdownTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const BreakdownTab = ({ projectData, updateProjectData }: BreakdownTabProps) => {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [showNoScenesAlert, setShowNoScenesAlert] = useState(true);

  const handleNewScene = () => {
    const newScene: Scene = {
      id: scenes.length + 1,
      title: `Scene ${scenes.length + 1}`,
      description: "",
      sceneDescription: "",
      voiceover: "",
      location: "",
      lighting: "",
      weather: ""
    };
    setScenes([...scenes, newScene]);
    setEditingScene(newScene);
    setShowNoScenesAlert(false);
  };

  const handleSaveScene = (updatedScene: Scene) => {
    setScenes(scenes.map(s => s.id === updatedScene.id ? updatedScene : s));
    setEditingScene(null);
  };

  const handleDismissAlert = () => {
    setShowNoScenesAlert(false);
  };

  return (
    <div className="min-h-full p-6">
      <h1 className="text-2xl font-bold mb-8">Breakdown</h1>
      
      {showNoScenesAlert && scenes.length === 0 && (
        <Alert className="mb-6 bg-[#080D20] border-none text-white">
          <div className="flex items-start">
            <Info className="h-5 w-5 mr-2 text-blue-400 mt-0.5" />
            <AlertDescription className="text-zinc-300">
              No scenes yet. Please provide more visual details in your prompt so we can better visualize it.
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
          {/* Scene items would go here */}
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

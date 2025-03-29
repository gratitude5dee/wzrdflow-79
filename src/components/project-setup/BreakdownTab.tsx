
import { type ProjectData } from './ProjectSetupWizard';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, Edit, Info } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SceneEditDialog, type Scene } from './SceneEditDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface BreakdownTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const BreakdownTab = ({ projectData, updateProjectData }: BreakdownTabProps) => {
  const [scenes, setScenes] = useState<Scene[]>([
    {
      id: 1,
      title: "Scene 1 - Gala Event",
      description: "An opulent gala hall with high ceilings, adorned with crystal chandeliers that reflect light onto polished marble floors. Rich red and gold decor accentuates the walls, while plush velvet drap...",
      sceneDescription: "A lavish gala hall adorned with shimmering chandeliers and opulent decor, showcasing the latest dream technology. Guests in elegant attire mingle, laughter and chatter filling the air. Eleanor Carter stands apart, her expression one of skepticism as she observes the superficiality surrounding her. Orion Blake approaches her, his presence adding an air of intrigue, as he begins to unveil the dark truths of the dream industry.",
      voiceover: "In a world where dreams are commodified, one woman dares to challenge the system.",
      location: "Grand Ballroom, Dream Corp Headquarters",
      lighting: "Evening, warm ambient lighting from crystal chandeliers",
      weather: "Clear night, visible through glass ceiling"
    },
    {
      id: 2,
      title: "Scene 2 - Rebel Meeting",
      description: "An underground hideout with exposed brick walls and low-hanging industrial lights casting shadows. The space is cluttered with old furniture, scattered papers, and high-tech equipment...",
      sceneDescription: "In a dimly lit underground hideout, Eleanor meets with the rebels. The room is filled with maps, blueprints, and digital screens displaying stolen data. The contrast between the analog and digital elements highlights the battle between human imagination and technological control. As they plan their resistance, the tension is palpable, emphasizing the high stakes of their mission.",
      voiceover: "Behind the veneer of luxury lies a network of resistance, fighting for the freedom to dream.",
      location: "Abandoned subway maintenance room",
      lighting: "Dim, with harsh spotlights over strategic areas",
      weather: "Unknown (underground)"
    }
  ]);

  const [editingScene, setEditingScene] = useState<Scene | null>(null);

  const handleNewScene = () => {
    const newScene: Scene = {
      id: scenes.length + 1,
      title: `Scene ${scenes.length + 1} - New Scene`,
      description: "",
      sceneDescription: "",
      voiceover: "",
      location: "",
      lighting: "",
      weather: ""
    };
    setScenes([...scenes, newScene]);
  };

  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
  };

  const handleSaveScene = (updatedScene: Scene) => {
    setScenes(scenes.map(s => s.id === updatedScene.id ? updatedScene : s));
    setEditingScene(null);
  };

  const handleDuplicateScene = (scene: Scene) => {
    const newScene = {
      ...scene,
      id: scenes.length + 1,
      title: `${scene.title} (Copy)`
    };
    setScenes([...scenes, newScene]);
  };

  const handleDeleteScene = (sceneId: number) => {
    setScenes(scenes.filter(s => s.id !== sceneId));
  };

  return (
    <div className="py-10 px-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-10">Breakdown</h1>
      
      <div className="mb-12">
        <h2 className="uppercase text-sm font-medium text-zinc-400 mb-2">SYNOPSIS</h2>
        <p className="text-zinc-300 leading-relaxed">
          {projectData.concept || "In a dystopian world where dreams are commodified, Eleanor Carter, a talented architect, joins rebels to reclaim humanity's freedom to dream. As she learns to design liberating dream realms, she faces moral dilemmas and confronts her mentor, culminating in a showdown at the Dream Nexus that restores the power of dreams for all."}
        </p>
      </div>

      <Separator className="my-10 bg-zinc-800/50" />
      
      <div className="space-y-10">
        {scenes.map((scene, index) => (
          <div key={scene.id} className="space-y-6">
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white">
                {scene.title}
              </h3>
              
              <p className="text-zinc-400">
                {scene.description || scene.location || "No description added yet."}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="uppercase text-sm font-medium text-zinc-400">SCENE DESCRIPTION</h4>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-xs cursor-help">
                        <Info className="w-3 h-3" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="w-64">Describe what's happening in this scene</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-zinc-300">
                  {scene.sceneDescription || "No scene description added yet."}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="uppercase text-sm font-medium text-zinc-400">VOICEOVER</h4>
                <p className="text-zinc-300 italic">
                  {scene.voiceover || "No voiceover added yet."}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800 border border-zinc-700"
                  onClick={() => handleEditScene(scene)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800 border border-zinc-700"
                  onClick={() => handleDuplicateScene(scene)}
                >
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Duplicate
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800 border border-zinc-700"
                  onClick={() => handleDeleteScene(scene.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
            
            {index < scenes.length - 1 && (
              <Separator className="my-6 bg-zinc-800/50" />
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-10 flex justify-center">
        <Button 
          onClick={handleNewScene}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          New scene
        </Button>
      </div>

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

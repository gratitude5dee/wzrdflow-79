
import { type ProjectData } from './ProjectSetupWizard';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, Edit } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { SceneEditDialog, type Scene } from './SceneEditDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
      title: "Scene 2 - The Enchanted Feast",
      description: "A beautifully decorated outdoor dining area under a canopy of vibrant flowers and twinkling lights, where the island's inhabitants welcome our adventurers with an elaborate feast...",
      sceneDescription: "The dining area is a visual feast, with tables adorned in rich fabrics and gleaming silverware. Lanterns float mysteriously in the air, casting a warm glow over the scene. The island's inhabitants, dressed in flowing garments, serve exotic dishes that seem to shimmer with an otherworldly quality.",
      voiceover: "The feast before us is a celebration of beauty and abundance, yet something in the air speaks of secrets untold."
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">SYNOPSIS</h2>
        <p className="text-zinc-300 leading-relaxed">
          {projectData.concept || "In a dystopian world where dreams are commodified, Eleanor Carter, a talented architect, joins rebels to reclaim humanity's freedom to dream. As she learns to design liberating dream realms, she faces moral dilemmas and confronts her mentor, culminating in a showdown at the Dream Nexus that restores the power of dreams for all."}
        </p>
      </div>

      <div className="space-y-6">
        {scenes.map((scene) => (
          <Card key={scene.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden hover:bg-zinc-900/60 transition-colors">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-white">{scene.title}</h3>
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => handleDeleteScene(scene.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete scene</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => handleDuplicateScene(scene)}
                        >
                          <Copy className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Duplicate scene</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-zinc-400 hover:text-white"
                          onClick={() => handleEditScene(scene)}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit scene</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <p className="text-zinc-400">{scene.description || scene.location}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium uppercase text-zinc-400">SCENE DESCRIPTION</h4>
                  <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-xs">?</div>
                </div>
                <p className="text-zinc-300">{scene.sceneDescription}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium uppercase text-zinc-400">VOICEOVER</h4>
                <p className="text-zinc-300 italic">{scene.voiceover}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
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

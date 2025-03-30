
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Info } from "lucide-react";

export interface Scene {
  id: string;
  number: number;
  title: string;
  description: string;
  sceneDescription: string;
  voiceover: string;
  location?: string;
  lighting?: string;
  weather?: string;
}

interface SceneEditDialogProps {
  scene: Scene;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (scene: Scene) => void;
}

export function SceneEditDialog({ scene, open, onOpenChange, onSave }: SceneEditDialogProps) {
  const [editedScene, setEditedScene] = useState<Scene>(scene);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900/95 border border-zinc-800 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-medium text-white">Edit Scene {scene.number}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">SCENE NAME</label>
              <Input
                value={editedScene.title}
                onChange={(e) => setEditedScene({ ...editedScene, title: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">LOCATION</label>
              <Textarea
                value={editedScene.location}
                onChange={(e) => setEditedScene({ ...editedScene, location: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white h-32"
                placeholder="E.g., 'Downtown café, interior, booth by the window...'"
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">LIGHTING</label>
              <Input
                value={editedScene.lighting}
                onChange={(e) => setEditedScene({ ...editedScene, lighting: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white"
                placeholder="E.g., 'Warm morning sunlight through café windows...'"
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">WEATHER</label>
              <Input
                value={editedScene.weather}
                onChange={(e) => setEditedScene({ ...editedScene, weather: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white"
                placeholder="E.g., 'Rainy day, water droplets on window...'"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">SCENE DESCRIPTION*</label>
              <Textarea
                value={editedScene.sceneDescription}
                onChange={(e) => setEditedScene({ ...editedScene, sceneDescription: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white h-64"
                placeholder="Describe the action, mood, and visuals of this scene..."
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase text-zinc-400">VOICEOVER</label>
              <Input
                value={editedScene.voiceover}
                onChange={(e) => setEditedScene({ ...editedScene, voiceover: e.target.value })}
                className="mt-1.5 bg-zinc-900 border-zinc-800 text-white"
                placeholder="Any narration or voiceover text for this scene..."
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-zinc-700 hover:bg-zinc-800 text-white"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onSave(editedScene);
              onOpenChange(false);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

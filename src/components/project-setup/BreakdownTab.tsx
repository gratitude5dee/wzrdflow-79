
import { type ProjectData } from './ProjectSetupWizard';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Edit } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface BreakdownTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

interface Scene {
  id: number;
  title: string;
  description: string;
  sceneDescription: string;
  voiceover: string;
}

const BreakdownTab = ({ projectData, updateProjectData }: BreakdownTabProps) => {
  const [scenes] = useState<Scene[]>([
    {
      id: 1,
      title: "Scene 1 - Arrival at the Island",
      description: "A fog-shrouded island with vibrant flora and lush greenery, where the mist creates an ethereal atmosphere. The landscape is dotted with colorful flowers and trees, their leaves glistening wit...",
      sceneDescription: "A breathtaking view of a fog-shrouded island emerges as the adventurers approach by boat. Lush greenery and vibrant flowers contrast against the soft, white mist enveloping the landscape. The air is filled with the sweet scent of blooming flora, and the sound of gentle waves lapping against the boat sets a serene atmosphere. The adventurers, filled with excitement and curiosity, gaze in awe at their surroundings, unaware of the darker truths that lie ahead.",
      voiceover: "We are drawn to the unknown, our hearts racing with the allure of adventure. This island, shrouded in mist, whispers secrets of paradise."
    },
    {
      id: 2,
      title: "Scene 2 - The Enchanted Feast",
      description: "A beautifully decorated outdoor dining area under a canopy of vibrant flowers and twinkling lights, where the island's inhabitants welcome our adventurers with an elaborate feast...",
      sceneDescription: "The dining area is a visual feast, with tables adorned in rich fabrics and gleaming silverware. Lanterns float mysteriously in the air, casting a warm glow over the scene. The island's inhabitants, dressed in flowing garments, serve exotic dishes that seem to shimmer with an otherworldly quality.",
      voiceover: "The feast before us is a celebration of beauty and abundance, yet something in the air speaks of secrets untold."
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Synopsis Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">SYNOPSIS</h2>
        <p className="text-zinc-300 leading-relaxed">
          {projectData.concept || "In 'Veil of Mist', five adventurers discover a fog-shrouded island that appears to be a paradise. As they indulge in its beauty, they uncover dark truths about the island's existence and must confront their motivations to either stay in bliss or return to reality. The choice reveals their true selves amidst surreal visions and emotional confrontations."}
        </p>
      </div>

      {/* Scenes Section */}
      <div className="space-y-6">
        {scenes.map((scene) => (
          <Card key={scene.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
            <div className="p-6 space-y-4">
              {/* Scene Header */}
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-white">{scene.title}</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Copy className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-zinc-400">{scene.description}</p>

              {/* Scene Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium uppercase text-zinc-400">SCENE DESCRIPTION</h4>
                  <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-xs">?</div>
                </div>
                <p className="text-zinc-300">{scene.sceneDescription}</p>
              </div>

              {/* Voiceover */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium uppercase text-zinc-400">VOICEOVER</h4>
                <p className="text-zinc-300 italic">{scene.voiceover}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default BreakdownTab;

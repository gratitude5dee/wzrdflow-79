
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, FileCode, Shirt, Mic2, Music } from 'lucide-react';
import CodeRepoContainer from '@/components/code-repo/CodeRepoContainer';

const StoryboardPage = () => {
  const [scenes, setScenes] = useState([1]); // Initial scene
  
  const addScene = () => {
    setScenes(prev => [...prev, prev.length + 1]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem-1.5rem)]">
      {/* Left sidebar */}
      <div className="w-72 bg-zinc-900 border-r border-zinc-800 text-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-blue-400 mb-4">RETURN TO ELDRIDGE</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Sarah Thompson returns to Eldridge, evoking nostalgia as she steps into her childhood town.
          </p>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-4 h-4 text-zinc-500" />
                <h3 className="text-zinc-300 text-sm uppercase">Location</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Description</p>
                  <Input 
                    placeholder="Describe the location..." 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Lighting</p>
                  <Input 
                    placeholder="Describe the lighting..." 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Weather</p>
                  <Input 
                    placeholder="Describe the weather..." 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="w-4 h-4 text-zinc-500" />
                <h3 className="text-zinc-300 text-sm uppercase">Style</h3>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Video Style</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                    Standard
                  </Button>
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                    Cinematic
                  </Button>
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                    Film Noir
                  </Button>
                  <Button variant="outline" size="sm" className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700">
                    Anime
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shirt className="w-4 h-4 text-zinc-500" />
                <h3 className="text-zinc-300 text-sm uppercase">Clothing</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-zinc-300 text-sm mb-2">Sound</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic2 className="w-4 h-4 text-zinc-500" />
                    <p className="text-xs text-zinc-300 uppercase">Voiceover</p>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Music className="w-4 h-4 text-zinc-500" />
                    <p className="text-xs text-zinc-300 uppercase">Scene Sound</p>
                  </div>
                  <Input 
                    placeholder='E.g., "Ocean waves..."' 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-zinc-900 overflow-y-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-amber-500">SCENE 1</h2>
          
          {/* Added the Code Repository component here */}
          <div className="w-64 h-80">
            <CodeRepoContainer />
          </div>
        </div>

        <div className="flex flex-wrap gap-6">
          {[1, 2, 3, 4].map((shotNumber) => (
            <div 
              key={shotNumber}
              className="w-72 bg-black/30 border border-zinc-800 rounded-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-video bg-black/50 relative flex items-center justify-center">
                <div className="absolute top-2 left-2">
                  <span className="text-sm bg-black/50 px-2 py-1 rounded-full text-white">
                    #{shotNumber}
                  </span>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">Shot Type</p>
                  <Input 
                    className="bg-zinc-800 border-zinc-700 text-white" 
                  />
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">Prompt</p>
                  <Textarea 
                    placeholder="Describe your shot..." 
                    className="bg-zinc-800 border-zinc-700 text-white min-h-20"
                  />
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">Character Dialogue</p>
                  <Input 
                    placeholder="Add character dialogue..." 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">Sound Effects</p>
                  <Input 
                    placeholder='E.g., "Ocean waves..."' 
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={addScene}
            className="mt-8 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white fixed bottom-6 right-6"
          >
            <Plus className="w-4 h-4" />
            Add a scene
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPage;

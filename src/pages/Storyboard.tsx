
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings, FileCode, Shirt, Mic2, Music, MoreVertical, Mic, Play, Share, MoreHorizontal } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const StoryboardPage = () => {
  const [scenes, setScenes] = useState([1]); // Initial scene
  const [selectedVideoStyle, setSelectedVideoStyle] = useState('standard');
  
  const addScene = () => {
    setScenes(prev => [...prev, prev.length + 1]);
  };

  return (
    <div className="flex h-[calc(100vh-4rem-1.5rem)] bg-[#0F1117]">
      {/* Left sidebar */}
      <div className="w-72 bg-[#0B0D14] border-r border-[#1D2130] text-white overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-[#2F7BBC] mb-2">RETURN TO ELDRIDGE</h2>
          <p className="text-zinc-400 text-sm mb-8">
            Sarah Thompson returns to Eldridge, evoking nostalgia as she steps into her childhood town.
          </p>

          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Location</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Description</p>
                  <Input 
                    placeholder="Describe the location..." 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Lighting</p>
                  <Input 
                    placeholder="Describe the lighting..." 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Weather</p>
                  <Input 
                    placeholder="Describe the weather..." 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileCode className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Style</h3>
              </div>

              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Video Style</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${selectedVideoStyle === 'standard' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#141824] border-[#2D3343] text-white'} hover:bg-purple-700`}
                    onClick={() => setSelectedVideoStyle('standard')}
                  >
                    Standard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${selectedVideoStyle === 'cinematic' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#141824] border-[#2D3343] text-white'} hover:bg-purple-700`}
                    onClick={() => setSelectedVideoStyle('cinematic')}
                  >
                    Cinematic
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${selectedVideoStyle === 'filmNoir' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#141824] border-[#2D3343] text-white'} hover:bg-purple-700`}
                    onClick={() => setSelectedVideoStyle('filmNoir')}
                  >
                    Film Noir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`${selectedVideoStyle === 'anime' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-[#141824] border-[#2D3343] text-white'} hover:bg-purple-700`}
                    onClick={() => setSelectedVideoStyle('anime')}
                  >
                    Anime
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shirt className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Clothing</h3>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1D2130]">
              <h3 className="text-zinc-200 font-medium mb-4">Sound</h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Mic className="w-5 h-5 text-zinc-500" />
                    <p className="text-zinc-200 font-medium">Voiceover</p>
                  </div>
                  <div className="bg-[#141824] border border-[#2D3343] rounded-md p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-[#2F7BBC] rounded-md flex items-center justify-center text-white">
                        ST
                      </div>
                      <span className="text-sm text-zinc-300">Sarah Thompson</span>
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-200">
                      <Play className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Music className="w-5 h-5 text-zinc-500" />
                    <p className="text-zinc-200 font-medium">Scene Sound</p>
                  </div>
                  <Input 
                    placeholder='E.g., "Ocean waves..."' 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 bg-[#0F1117] overflow-y-auto p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#FFB628]">SCENE 1</h2>
        </div>

        <div className="flex flex-wrap gap-6">
          {[1, 2, 3, 4].map((shotNumber) => (
            <div 
              key={shotNumber}
              className="w-72 bg-[#0B0D14] border border-[#1D2130] rounded-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-video bg-black relative flex items-center justify-center">
                <div className="absolute top-2 left-2">
                  <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white">
                    #{shotNumber}
                  </span>
                </div>
                <div className="absolute top-2 right-2">
                  <button className="text-white/70 hover:text-white">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Shot Type</p>
                  <Select>
                    <SelectTrigger className="bg-[#141824] border-[#2D3343] text-white">
                      <SelectValue placeholder="Select shot type" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#141824] border-[#2D3343] text-white">
                      <SelectItem value="wide">Wide Shot</SelectItem>
                      <SelectItem value="medium">Medium Shot</SelectItem>
                      <SelectItem value="close">Close-up</SelectItem>
                      <SelectItem value="extreme">Extreme Close-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Prompt</p>
                  <Textarea 
                    placeholder="Describe your shot..." 
                    className="bg-[#141824] border-[#2D3343] text-white min-h-20 rounded-md"
                  />
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Character Dialogue</p>
                  <Input 
                    placeholder="Add character dialogue..." 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
                
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-2">Sound Effects</p>
                  <Input 
                    placeholder='E.g., "Ocean waves..."' 
                    className="bg-[#141824] border-[#2D3343] text-white rounded-md"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <Button 
            onClick={addScene}
            className="mt-8 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white fixed bottom-6 right-6 rounded-full h-12 w-12 p-0 justify-center shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="sr-only">Add a scene</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPage;


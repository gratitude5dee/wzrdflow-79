
import { useState } from 'react';
import { type ProjectData } from './ProjectSetupWizard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, RefreshCw, ImageIcon, Wand2, Edit, Repeat } from 'lucide-react';

interface SettingsTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

type AspectRatioOption = '16:9' | '1:1' | '9:16';
type VideoStyleOption = 'none' | 'cinematic' | 'scribble' | 'film-noir';

interface Character {
  id: string;
  name: string;
  description: string;
  image?: string;
  generating?: boolean;
}

const SettingsTab = ({ projectData, updateProjectData }: SettingsTabProps) => {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>('16:9');
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<VideoStyleOption>('cinematic');
  
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Lara Thompson',
      description: 'Adventurer discovering the island secrets',
      generating: false
    },
    {
      id: '2',
      name: 'Sam Carter',
      description: 'Skeptical adventurer questioning reality',
      generating: false
    },
    {
      id: '3',
      name: 'Jamie Lee',
      description: 'Optimistic adventurer enjoying the journey',
      generating: true
    },
    {
      id: '4',
      name: 'Alex Martinez',
      description: 'Pragmatic adventurer weighing options',
      generating: true
    },
    {
      id: '5',
      name: 'Mia Robinson',
      description: 'Compassionate adventurer feeling connected',
      generating: true
    }
  ]);

  const handleAspectRatioChange = (ratio: AspectRatioOption) => {
    setSelectedAspectRatio(ratio);
  };

  const handleVideoStyleChange = (style: VideoStyleOption) => {
    setSelectedVideoStyle(style);
  };

  const handleAddCharacter = () => {
    setCharacters([
      ...characters,
      {
        id: `${characters.length + 1}`,
        name: '',
        description: '',
        generating: true
      }
    ]);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Settings Section */}
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6">Settings</h2>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="projectName" className="block text-sm font-medium text-blue-300">
                PROJECT NAME<span className="text-blue-400">*</span>
              </label>
              <Input 
                id="projectName"
                value={projectData.title || 'Veil of Mist'} 
                onChange={e => updateProjectData({ title: e.target.value })}
                placeholder="Enter your project name"
                className="bg-zinc-900 border-zinc-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-blue-300">
                ASPECT RATIO
              </label>
              <div className="flex space-x-4">
                <Button 
                  onClick={() => handleAspectRatioChange('16:9')}
                  className={`flex items-center justify-center h-20 w-24 rounded-xl transition-all transform hover:scale-105 ${
                    selectedAspectRatio === '16:9' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-7 border-2 border-current rounded-sm mb-1"></div>
                    <span className="text-xs">16:9</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleAspectRatioChange('1:1')}
                  className={`flex items-center justify-center h-20 w-24 rounded-xl transition-all transform hover:scale-105 ${
                    selectedAspectRatio === '1:1' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 border-2 border-current rounded-sm mb-1"></div>
                    <span className="text-xs">1:1</span>
                  </div>
                </Button>
                
                <Button 
                  onClick={() => handleAspectRatioChange('9:16')}
                  className={`flex items-center justify-center h-20 w-24 rounded-xl transition-all transform hover:scale-105 ${
                    selectedAspectRatio === '9:16' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-9 border-2 border-current rounded-sm mb-1"></div>
                    <span className="text-xs">9:16</span>
                  </div>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-blue-300">
                  VIDEO STYLE
                </label>
                <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                <Button
                  onClick={() => handleVideoStyleChange('none')}
                  className={`flex flex-col items-center justify-center h-24 p-2 rounded-xl transition-all transform hover:scale-105 ${
                    selectedVideoStyle === 'none' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-full h-12 bg-zinc-800 rounded-md flex items-center justify-center mb-2">
                    <div className="w-10 h-1 bg-zinc-600 rounded-full"></div>
                  </div>
                  <span className="text-xs">None</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('cinematic')}
                  className={`flex flex-col items-center justify-center h-24 p-2 rounded-xl transition-all transform hover:scale-105 ${
                    selectedVideoStyle === 'cinematic' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-full h-12 bg-zinc-800 rounded-md overflow-hidden mb-2">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(/lovable-uploads/40c6c223-9220-4e7d-bd5d-a98093f96400.png)' }}></div>
                  </div>
                  <span className="text-xs">Cinematic</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('scribble')}
                  className={`flex flex-col items-center justify-center h-24 p-2 rounded-xl transition-all transform hover:scale-105 ${
                    selectedVideoStyle === 'scribble' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-full h-12 bg-zinc-800 rounded-md flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                      <path d="M12 12v9"></path>
                      <path d="m8 17 4 4 4-4"></path>
                    </svg>
                  </div>
                  <span className="text-xs">Scribble</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('film-noir')}
                  className={`flex flex-col items-center justify-center h-24 p-2 rounded-xl transition-all transform hover:scale-105 ${
                    selectedVideoStyle === 'film-noir' 
                      ? 'bg-blue-900/50 border-2 border-blue-500 text-white shadow-md shadow-blue-600/20' 
                      : 'bg-zinc-900 border border-zinc-700 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <div className="w-full h-12 bg-zinc-800 rounded-md flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M8 12h8"></path>
                      <path d="M12 8v8"></path>
                    </svg>
                  </div>
                  <span className="text-xs">Film Noir</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-blue-300">
                <span>STYLE REFERENCE</span>
                <button className="ml-2 p-1 rounded-full hover:bg-blue-900/50 text-blue-400 transition-colors" title="Get more information">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v-4"></path>
                    <path d="M12 8h.01"></path>
                  </svg>
                </button>
              </div>
              
              <div className="relative bg-zinc-900 border border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center gap-2 group transition-all hover:border-blue-500/50 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <ImageIcon className="h-10 w-10 text-zinc-600 group-hover:text-blue-400 transition-colors" />
                <p className="text-zinc-500 text-sm font-medium group-hover:text-zinc-300 transition-colors">Drag image here</p>
                <p className="text-zinc-600 text-xs group-hover:text-zinc-400 transition-colors">Or upload a file</p>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Wand2 className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="cinematic-inspiration" className="block text-sm font-medium text-blue-300">
                CINEMATIC INSPIRATION
              </label>
              <Textarea 
                id="cinematic-inspiration"
                placeholder="E.g., 'Retro, gritty, eclectic, stylish, noir...'"
                className="bg-zinc-900 border-zinc-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors min-h-[80px]"
              />
            </div>
          </div>
        </div>
        
        {/* Cast Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">Cast</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Add Character Card */}
            <Card 
              onClick={handleAddCharacter}
              className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 rounded-xl cursor-pointer h-56 group transition-all hover:shadow-md hover:shadow-blue-600/10 hover:border-blue-500/50"
            >
              <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-blue-900/30 transition-colors">
                <Plus className="h-8 w-8 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-zinc-400 font-medium group-hover:text-blue-300 transition-colors">Add character</p>
            </Card>
            
            {/* Character Cards */}
            {characters.map((character) => (
              <Card key={character.id} className="relative p-0 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 rounded-xl overflow-hidden h-56 group transition-all hover:shadow-md hover:shadow-purple-600/10 hover:border-purple-500/50">
                {character.generating ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <div className="w-14 h-14 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-3"></div>
                    <div className="flex flex-col items-center">
                      <p className="font-medium text-zinc-300">{character.name}</p>
                      <p className="text-xs text-zinc-500 text-center mt-1">{character.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Retry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70"></div>
                    
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-black/30 hover:bg-black/50 rounded-md">
                        <Repeat className="h-3.5 w-3.5 text-zinc-300" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 bg-black/30 hover:bg-black/50 rounded-md">
                        <Edit className="h-3.5 w-3.5 text-zinc-300" />
                      </Button>
                    </div>
                    
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <h3 className="font-medium text-white">{character.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1">{character.description}</p>
                    </div>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

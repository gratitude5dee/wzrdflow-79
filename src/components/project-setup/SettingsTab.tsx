
import { useState } from 'react';
import { type ProjectData } from './ProjectSetupWizard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, ImageIcon, HelpCircle } from 'lucide-react';

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
}

const SettingsTab = ({ projectData, updateProjectData }: SettingsTabProps) => {
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>('16:9');
  const [selectedVideoStyle, setSelectedVideoStyle] = useState<VideoStyleOption>('cinematic');
  
  const [characters, setCharacters] = useState<Character[]>([
    {
      id: '1',
      name: 'Lara Thompson',
      description: 'Adventurer discovering the island secrets',
      image: '/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png'
    },
    {
      id: '2',
      name: 'Sam Carter',
      description: 'Skeptical adventurer questioning reality',
      image: '/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png'
    },
    {
      id: '3',
      name: 'Jamie Lee',
      description: 'Optimistic adventurer enjoying the journey',
      image: '/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png'
    },
    {
      id: '4',
      name: 'Alex Martinez',
      description: 'Pragmatic adventurer weighing options',
      image: '/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png'
    },
    {
      id: '5',
      name: 'Mia Robinson',
      description: 'Compassionate adventurer feeling connected',
      image: '/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png'
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
        description: ''
      }
    ]);
  };

  return (
    <div className="min-h-full bg-[#121212] text-white">
      <div className="flex flex-col md:flex-row">
        {/* Settings Section */}
        <div className="w-full md:w-5/12 p-6 border-r border-zinc-800">
          <h2 className="text-2xl font-semibold mb-6">Settings</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="projectName" className="block text-sm font-medium text-gray-400 uppercase">
                Project Name<span className="text-red-500">*</span>
              </Label>
              <Input 
                id="projectName"
                value={projectData.title || 'Veil of Mist'} 
                onChange={e => updateProjectData({ title: e.target.value })}
                placeholder="Enter your project name"
                className="w-full bg-[#1E1E1E] border-zinc-700 rounded text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="block text-sm font-medium text-gray-400 uppercase">
                Aspect Ratio
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => handleAspectRatioChange('16:9')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center h-16 ${
                    selectedAspectRatio === '16:9' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-8 h-5 border border-current rounded-sm mb-1"></div>
                  <span className="text-xs">16:9</span>
                </Button>
                
                <Button 
                  onClick={() => handleAspectRatioChange('1:1')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center h-16 ${
                    selectedAspectRatio === '1:1' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-5 h-5 border border-current rounded-sm mb-1"></div>
                  <span className="text-xs">1:1</span>
                </Button>
                
                <Button 
                  onClick={() => handleAspectRatioChange('9:16')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center h-16 ${
                    selectedAspectRatio === '9:16' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-4 h-7 border border-current rounded-sm mb-1"></div>
                  <span className="text-xs">9:16</span>
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="block text-sm font-medium text-gray-400 uppercase">
                  Video Style
                </Label>
                <Button variant="link" size="sm" className="text-xs text-blue-400 h-auto p-0">
                  View All <ChevronRight className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="grid grid-cols-4 gap-3">
                <Button
                  onClick={() => handleVideoStyleChange('none')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-2 aspect-square ${
                    selectedVideoStyle === 'none' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-full h-8 bg-zinc-800 rounded flex items-center justify-center mb-2">
                    <div className="w-6 h-0.5 bg-zinc-600 rounded-full"></div>
                  </div>
                  <span className="text-xs">None</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('cinematic')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-2 aspect-square ${
                    selectedVideoStyle === 'cinematic' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-full h-8 bg-zinc-800 rounded mb-2 overflow-hidden">
                    <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: 'url(/lovable-uploads/107bad81-0693-494e-8454-9075c3556cf5.png)' }}></div>
                  </div>
                  <span className="text-xs">Cinematic</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('scribble')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-2 aspect-square ${
                    selectedVideoStyle === 'scribble' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-full h-8 bg-zinc-800 rounded mb-2">
                    <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <span className="text-xs">Scribble</span>
                </Button>
                
                <Button
                  onClick={() => handleVideoStyleChange('film-noir')}
                  variant="outline"
                  className={`flex flex-col items-center justify-center p-2 aspect-square ${
                    selectedVideoStyle === 'film-noir' 
                      ? 'bg-blue-900 border-blue-500 text-white' 
                      : 'bg-[#1E1E1E] border-zinc-700 text-gray-400'
                  }`}
                >
                  <div className="w-full h-8 bg-zinc-800 rounded mb-2">
                    <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 8v8" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                  <span className="text-xs">Film Noir</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center text-sm font-medium text-gray-400 uppercase">
                <span>Style Reference</span>
                <HelpCircle className="ml-2 h-4 w-4 text-gray-500" />
              </div>
              
              <div className="relative border border-zinc-700 rounded p-8 flex flex-col items-center justify-center gap-2 bg-[#1E1E1E] cursor-pointer hover:border-gray-500 transition-colors">
                <ImageIcon className="h-6 w-6 text-gray-500" />
                <p className="text-gray-400 text-sm">Drag image here</p>
                <p className="text-gray-500 text-xs">Or upload a file</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cinematic-inspiration" className="block text-sm font-medium text-gray-400 uppercase">
                Cinematic Inspiration
              </Label>
              <Textarea 
                id="cinematic-inspiration"
                placeholder="E.g., 'Retro, gritty, eclectic, stylish, noir...'"
                className="bg-[#1E1E1E] border-zinc-700 text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Cast Section */}
        <div className="w-full md:w-7/12 p-6">
          <h2 className="text-2xl font-semibold mb-6">Cast</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Add Character Card */}
            <div 
              onClick={handleAddCharacter}
              className="border border-zinc-800 rounded aspect-[3/4] flex flex-col items-center justify-center p-4 bg-[#1E1E1E] cursor-pointer hover:border-gray-600 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                <Plus className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-400">Add character</p>
            </div>
            
            {/* Character Cards */}
            {characters.map((character) => (
              <div 
                key={character.id} 
                className="border border-zinc-800 rounded aspect-[3/4] overflow-hidden relative group"
              >
                {character.image ? (
                  <>
                    <img 
                      src={character.image} 
                      alt={character.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-medium">{character.name}</h3>
                      <p className="text-xs text-gray-300 line-clamp-2">{character.description}</p>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Character name"
                      className="bg-transparent border-b border-zinc-700 text-center text-white mb-2 w-full"
                      value={character.name}
                      onChange={(e) => {
                        const newCharacters = [...characters];
                        const index = newCharacters.findIndex(c => c.id === character.id);
                        newCharacters[index].name = e.target.value;
                        setCharacters(newCharacters);
                      }}
                    />
                    <textarea
                      placeholder="Character description"
                      className="bg-transparent border border-zinc-700 rounded text-center text-white text-sm w-full"
                      value={character.description}
                      onChange={(e) => {
                        const newCharacters = [...characters];
                        const index = newCharacters.findIndex(c => c.id === character.id);
                        newCharacters[index].description = e.target.value;
                        setCharacters(newCharacters);
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

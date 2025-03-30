
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
  
  const [characters, setCharacters] = useState<Character[]>([]);

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
    <div className="min-h-full flex flex-col md:flex-row">
      {/* Settings Section */}
      <div className="w-full md:w-1/2 p-6 border-r border-zinc-800">
        <h2 className="text-2xl font-semibold mb-6">Settings</h2>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="block text-sm font-medium text-gray-400 uppercase">
              PROJECT NAME<span className="text-red-500">*</span>
            </Label>
            <Input 
              id="projectName"
              value={projectData.title || ''} 
              onChange={e => updateProjectData({ title: e.target.value })}
              placeholder="Enter your project name"
              className="w-full bg-[#111319] border-zinc-700 rounded text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-400 uppercase">
              ASPECT RATIO
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => handleAspectRatioChange('16:9')}
                className={`flex flex-col items-center justify-center h-12 rounded border ${
                  selectedAspectRatio === '16:9' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#18191E] border-zinc-700 text-gray-400'
                }`}
              >
                <div className="w-8 h-5 border border-current rounded-sm mb-1"></div>
                <span className="text-xs">16:9</span>
              </button>
              
              <button 
                onClick={() => handleAspectRatioChange('1:1')}
                className={`flex flex-col items-center justify-center h-12 rounded border ${
                  selectedAspectRatio === '1:1' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#18191E] border-zinc-700 text-gray-400'
                }`}
              >
                <div className="w-5 h-5 border border-current rounded-sm mb-1"></div>
                <span className="text-xs">1:1</span>
              </button>
              
              <button 
                onClick={() => handleAspectRatioChange('9:16')}
                className={`flex flex-col items-center justify-center h-12 rounded border ${
                  selectedAspectRatio === '9:16' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-[#18191E] border-zinc-700 text-gray-400'
                }`}
              >
                <div className="w-4 h-7 border border-current rounded-sm mb-1"></div>
                <span className="text-xs">9:16</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="block text-sm font-medium text-gray-400 uppercase">
                VIDEO STYLE
              </Label>
              <button className="text-xs text-blue-400 flex items-center">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => handleVideoStyleChange('none')}
                className={`relative p-1 pb-6 aspect-square rounded border ${
                  selectedVideoStyle === 'none' 
                    ? 'border-blue-500' 
                    : 'border-zinc-700'
                }`}
              >
                <div className="w-full h-full bg-zinc-800 rounded-sm flex items-center justify-center">
                  <div className="w-6 h-0.5 bg-zinc-600 rounded-full"></div>
                </div>
                <span className={`absolute bottom-1 left-0 right-0 text-center text-xs ${
                  selectedVideoStyle === 'none' ? 'text-white' : 'text-gray-400'
                }`}>None</span>
              </button>
              
              <button
                onClick={() => handleVideoStyleChange('cinematic')}
                className={`relative p-1 pb-6 aspect-square rounded border ${
                  selectedVideoStyle === 'cinematic' 
                    ? 'border-blue-500' 
                    : 'border-zinc-700'
                }`}
              >
                <div className="w-full h-full bg-[#18191E] rounded-sm overflow-hidden">
                  <img 
                    src="/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png" 
                    alt="Cinematic"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`absolute bottom-1 left-0 right-0 text-center text-xs ${
                  selectedVideoStyle === 'cinematic' ? 'text-white' : 'text-gray-400'
                }`}>Cinematic</span>
              </button>
              
              <button
                onClick={() => handleVideoStyleChange('scribble')}
                className={`relative p-1 pb-6 aspect-square rounded border ${
                  selectedVideoStyle === 'scribble' 
                    ? 'border-blue-500' 
                    : 'border-zinc-700'
                }`}
              >
                <div className="w-full h-full bg-[#18191E] rounded-sm">
                  <img 
                    src="/lovable-uploads/4e20f36a-2bff-48d8-b07b-257334e35506.png" 
                    alt="Scribble"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`absolute bottom-1 left-0 right-0 text-center text-xs ${
                  selectedVideoStyle === 'scribble' ? 'text-white' : 'text-gray-400'
                }`}>Scribble</span>
              </button>
              
              <button
                onClick={() => handleVideoStyleChange('film-noir')}
                className={`relative p-1 pb-6 aspect-square rounded border ${
                  selectedVideoStyle === 'film-noir' 
                    ? 'border-blue-500' 
                    : 'border-zinc-700'
                }`}
              >
                <div className="w-full h-full bg-[#18191E] rounded-sm">
                  <img 
                    src="/lovable-uploads/96cbbf8f-bdb1-4d37-9c62-da1306d5fb96.png" 
                    alt="Film Noir"
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                </div>
                <span className={`absolute bottom-1 left-0 right-0 text-center text-xs ${
                  selectedVideoStyle === 'film-noir' ? 'text-white' : 'text-gray-400'
                }`}>Film Noir</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center text-sm font-medium text-gray-400 uppercase">
              <span>STYLE REFERENCE</span>
              <HelpCircle className="ml-2 h-4 w-4 text-gray-500" />
            </div>
            
            <div className="relative border border-zinc-700 rounded p-8 flex flex-col items-center justify-center gap-2 bg-[#18191E] cursor-pointer hover:border-gray-500 transition-colors">
              <ImageIcon className="h-6 w-6 text-gray-500" />
              <p className="text-gray-400 text-sm">Drag image here</p>
              <p className="text-gray-500 text-xs">Or upload a file</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cinematic-inspiration" className="block text-sm font-medium text-gray-400 uppercase">
              CINEMATIC INSPIRATION
            </Label>
            <Textarea 
              id="cinematic-inspiration"
              placeholder="E.g., 'Retro, gritty, eclectic, stylish, noir...'"
              className="bg-[#111319] border-zinc-700 text-white"
            />
          </div>
        </div>
      </div>
      
      {/* Cast Section */}
      <div className="w-full md:w-1/2 p-6">
        <h2 className="text-2xl font-semibold mb-6">Cast</h2>
        
        <div className="flex justify-center items-center">
          <div
            onClick={handleAddCharacter}
            className="border border-zinc-800 rounded aspect-[3/4] w-56 flex flex-col items-center justify-center p-4 bg-[#18191E] cursor-pointer hover:border-gray-600 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-[#222] flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-400">Add character</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;

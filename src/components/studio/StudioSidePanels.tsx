
import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { ModelListItem } from './StudioUtils';

interface StudioSidePanelsProps {
  selectedBlockType: 'text' | 'image' | 'video' | null;
}

// AI models with their icons using appropriate Lucide icons
const getModelOptions = (type: 'text' | 'image' | 'video') => {
  if (type === 'text') {
    return [
      { id: 'gemini', name: 'Gemini 2.0 Flash', credits: 2, time: '~4s', description: 'A powerful language model from Gemini.' },
      { id: 'gpt4', name: 'GPT 4o Mini', credits: 2, time: '~4s' },
      { id: 'claude', name: 'Claude 3 Sonnet', credits: 2, time: '~4s' },
    ];
  } else if (type === 'image') {
    return [
      { id: 'flux-dev', name: 'Flux Dev', credits: 42, time: '~10s', description: 'Highly customizable image model.' },
      { id: 'flux-pro', name: 'Flux Pro 1.1', credits: 75, time: '~24s' },
      { id: 'ideogram', name: 'Ideogram 2.0', credits: 100, time: '~18s' },
      { id: 'luma', name: 'Luma Photon', credits: 24, time: '~20s' },
      { id: 'recraft', name: 'Recraft V3', credits: 50, time: '~14s' },
      { id: 'stable', name: 'Stable Diffusion 3.5', credits: 44, time: '~32s' },
    ];
  } else { // video
    return [
      { id: 'hailuo', name: 'Hailuo Minimax', credits: 375, time: '~4m', description: 'Powerful, motion-heavy model.' },
      { id: 'veo2', name: 'Veo2', credits: 1438, time: '~3m' },
      { id: 'wan', name: 'WAN 2.1', credits: 438, time: '~3m' },
      { id: 'kling-pro-16', name: 'Kling Pro 1.6', credits: 419, time: '~5m' },
      { id: 'kling-pro-15', name: 'Kling Pro 1.5', credits: 625, time: '~5m' },
      { id: 'luma-ray', name: 'Luma Ray 2', credits: 1250, time: '~2m' },
      { id: 'luma-ray-flash', name: 'Luma Ray 2 Flash', credits: 500, time: '~1m' },
      { id: 'pika', name: 'Pika', credits: 563, time: '~30s' },
      { id: 'tencent', name: 'Tencent Hunyuan', credits: 500, time: '~4m' },
      { id: 'lightricks', name: 'Lightricks LTXV', credits: 25, time: '~10s' },
    ];
  }
};

// The generic placeholder icon component for all model options
const ModelIcon = ({ type }: { type: string }) => (
  <div className="w-6 h-6 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xs">
    {type[0].toUpperCase()}
  </div>
);

export const StudioRightPanel = ({ selectedBlockType }: StudioSidePanelsProps) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [quality, setQuality] = useState(100);
  const [seed, setSeed] = useState('339071969');
  
  // If no block is selected, return empty panel
  if (!selectedBlockType) {
    return <div className="w-64 h-full bg-black border-l border-zinc-800/50"></div>;
  }
  
  const modelOptions = getModelOptions(selectedBlockType);
  
  return (
    <div className="w-64 h-full bg-zinc-900/75 border-l border-zinc-800/50">
      <div className="p-5 space-y-6">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">MODEL</label>
          <button 
            className="w-full flex items-center justify-between p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-md"
            onClick={() => setShowModelDropdown(!showModelDropdown)}
          >
            <span className="text-zinc-300">{modelOptions[0].name}</span>
            <ChevronDown className="h-4 w-4 text-zinc-500" />
          </button>
          
          {showModelDropdown && (
            <div className="mt-1 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg max-h-80 overflow-y-auto">
              {modelOptions.map((model) => (
                <ModelListItem 
                  key={model.id}
                  icon={<ModelIcon type={model.name} />}
                  name={model.name} 
                  description={model.description}
                  credits={model.credits} 
                  time={model.time}
                  isSelected={model.id === selectedModel}
                  onClick={() => {
                    setSelectedModel(model.id);
                    setShowModelDropdown(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {selectedBlockType === 'image' && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-zinc-500 font-medium">QUALITY</label>
                <span className="text-white">{quality}</span>
              </div>
              <Slider 
                value={[quality]}
                min={1} 
                max={100} 
                step={1}
                onValueChange={(value) => setQuality(value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SIZE</label>
              <button className="w-full flex items-center justify-between p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-md">
                <span className="text-zinc-300">Square (1:1)</span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SEED</label>
              <Input 
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

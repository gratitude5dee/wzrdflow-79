
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { X, CircleDashed } from 'lucide-react';

interface TextToImageNodeProps {
  data: {
    label?: string;
  };
}

const TextToImageNode = memo(({ data }: TextToImageNodeProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsGenerating(true);
    // TODO: Implement actual image generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="w-[600px] bg-black/90 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50">
        <h3 className="text-white font-medium">{data.label || 'Text to Image'}</h3>
        <div className="flex items-center gap-2">
          <button className="p-1 hover:bg-zinc-800 rounded">
            <div className="w-4 h-4 flex items-center justify-center border border-zinc-700 rounded-sm" />
          </button>
          <button className="text-zinc-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Preview */}
        <div className="aspect-video bg-zinc-900 rounded-lg overflow-hidden">
          {generatedImage ? (
            <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              Generated image will appear here...
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-24 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none border border-zinc-800 focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-zinc-600 rounded-sm" />
          </button>
        </div>
        <button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <CircleDashed className="w-4 h-4 animate-spin" />
              <span>Generate (~10s)</span>
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

TextToImageNode.displayName = 'TextToImageNode';

export default TextToImageNode;

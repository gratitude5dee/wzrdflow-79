
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Upload, X, CircleDashed } from 'lucide-react';

interface ImagesToVideoNodeProps {
  data: {
    label?: string;
  };
}

const ImagesToVideoNode = memo(({ data }: ImagesToVideoNodeProps) => {
  const [images, setImages] = useState<string[]>(Array(9).fill(null));
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleImageUpload = (index: number) => {
    // This is a placeholder for the actual upload functionality
    console.log('Upload image at index:', index);
  };

  const handleGenerate = () => {
    const uploadedImagesCount = images.filter(img => img !== null).length;
    if (uploadedImagesCount < 2) {
      console.log('Please upload at least 2 images');
      return;
    }
    setIsGenerating(true);
    // TODO: Implement actual video generation
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="w-[800px] p-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">{data.label || 'Images to Video'}</h3>
        <button className="text-zinc-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left Side - Image Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-2 mb-4 max-h-[300px] overflow-y-auto pr-2">
            {images.map((image, index) => (
              <div
                key={index}
                onClick={() => handleImageUpload(index)}
                className="aspect-square bg-zinc-800/50 rounded-lg flex items-center justify-center cursor-pointer hover:bg-zinc-700/50 transition-colors border border-zinc-700/50"
              >
                {image ? (
                  <img
                    src={image}
                    alt={`Frame ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-zinc-500" />
                )}
              </div>
            ))}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Prompt</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want your video to look..."
              className="w-full h-24 bg-zinc-800/50 text-white px-3 py-2 rounded-lg border border-zinc-700 focus:outline-none focus:border-teal-500 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Right Side - Preview */}
        <div className="flex-1">
          <div className="aspect-video bg-black rounded-lg flex items-center justify-center border border-zinc-800">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-2 text-zinc-500">
                <CircleDashed className="w-8 h-8 animate-spin" />
                <span className="text-sm">Generating video...</span>
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">
                Video preview will appear here
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors">
            <Upload className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <button
          onClick={handleGenerate}
          className={`px-4 py-2 bg-teal-500 text-white rounded-lg flex items-center gap-2 transition-colors ${
            images.filter(img => img !== null).length >= 2
              ? 'hover:bg-teal-600'
              : 'opacity-50 cursor-not-allowed'
          }`}
        >
          {isGenerating ? (
            <>
              <CircleDashed className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate video'
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

ImagesToVideoNode.displayName = 'ImagesToVideoNode';

export default ImagesToVideoNode;

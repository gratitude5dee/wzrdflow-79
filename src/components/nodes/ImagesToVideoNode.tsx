
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { Upload, X } from 'lucide-react';

interface ImagesToVideoNodeProps {
  data: {
    label?: string;
  };
}

const ImagesToVideoNode = memo(({ data }: ImagesToVideoNodeProps) => {
  const [images, setImages] = useState<string[]>(Array(9).fill(null));

  const handleImageUpload = (index: number) => {
    // This is a placeholder for the actual upload functionality
    console.log('Upload image at index:', index);
  };

  return (
    <div className="w-[600px] p-4 bg-zinc-900/90 backdrop-blur-sm border border-zinc-800 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-medium">{data.label || 'Images to Video'}</h3>
        <button className="text-zinc-400 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2 mb-4">
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

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-zinc-800 rounded-lg">
            <Upload className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <button className="px-4 py-2 bg-teal-500 text-white rounded-lg flex items-center gap-2 hover:bg-teal-600 transition-colors">
          Connect or upload at least 2 images
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

ImagesToVideoNode.displayName = 'ImagesToVideoNode';

export default ImagesToVideoNode;

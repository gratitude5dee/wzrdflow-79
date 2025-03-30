
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, RefreshCw, ImageIcon, Trash2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ImageStatus } from '@/types/storyboardTypes';

interface ShotImageProps {
  shotNumber?: number;
  imageUrl: string | null;
  imageStatus: ImageStatus;
  isGenerating: boolean;
  shotType: string;
}

const ShotImage: React.FC<ShotImageProps> = ({
  shotNumber,
  imageUrl,
  imageStatus,
  isGenerating,
  shotType
}) => {
  const getImageStatusDisplay = () => {
    switch (imageStatus) {
      case 'generating':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-2" />
              <p className="text-sm text-white font-medium">Generating image...</p>
              <p className="text-xs text-zinc-400">(This can take a minute)</p>
            </div>
          </div>
        );
      case 'failed':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900/70 backdrop-blur-sm">
            <div className="text-center p-2">
              <AlertCircle className="w-6 h-6 text-red-300 mx-auto mb-1" />
              <p className="text-sm text-white font-medium mb-2">Generation failed</p>
            </div>
          </div>
        );
      case 'completed':
        return null; // Image is shown
      case 'pending':
      default:
        return !imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0F1219]">
            <ImageIcon className="w-8 h-8 text-gray-700 opacity-50" />
          </div>
        );
    }
  };

  return (
    <div className="aspect-video bg-[#0F1219] relative flex items-center justify-center group/image">
      {/* Shot Number */}
      {shotNumber && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-sm bg-black/60 px-2 py-1 rounded-full text-white backdrop-blur-sm">
            #{shotNumber}
          </span>
        </div>
      )}

      {/* Image */}
      {imageUrl && imageStatus === 'completed' && (
        <img
          src={imageUrl}
          alt={`Shot ${shotNumber || ''}`}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
      )}

      {/* Status Overlay */}
      {getImageStatusDisplay()}
    </div>
  );
};

export default ShotImage;

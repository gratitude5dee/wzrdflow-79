
import React from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Plus, Film, Music, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { v4 as uuidv4 } from 'uuid';

const MediaPanel = () => {
  const { 
    mediaItems, 
    addMediaItem,
    selectMediaItem,
    selectedMediaIds
  } = useVideoEditor();

  // Mock function to add media items
  const handleAddMedia = (type: 'video' | 'image' | 'audio') => {
    const newMedia: Record<string, any> = {
      id: uuidv4(),
      type,
      startTime: 0,
      duration: 5,
    };
    
    switch (type) {
      case 'video':
        newMedia.name = `Video ${mediaItems.filter(m => m.type === 'video').length + 1}`;
        newMedia.url = '/placeholder.svg';
        break;
      case 'image':
        newMedia.name = `Image ${mediaItems.filter(m => m.type === 'image').length + 1}`;
        newMedia.url = '/placeholder.svg';
        break;
      case 'audio':
        newMedia.name = `Audio ${mediaItems.filter(m => m.type === 'audio').length + 1}`;
        newMedia.url = '';
        break;
    }
    
    addMediaItem(newMedia as any);
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex-none flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Media Library</h3>
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('video')}
          >
            <Film className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('image')}
          >
            <Image className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-[#1D2130] h-8 w-8 p-0"
            onClick={() => handleAddMedia('audio')}
          >
            <Music className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 space-y-2">
        {mediaItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Plus className="h-8 w-8 text-zinc-500 mb-2" />
            <p className="text-sm text-zinc-400">Add media to your project</p>
          </div>
        ) : (
          mediaItems.map((item) => (
            <div 
              key={item.id}
              className={`p-2 rounded-md cursor-pointer border ${
                selectedMediaIds.includes(item.id) 
                  ? 'bg-[#1D2130] border-purple-500' 
                  : 'border-transparent hover:bg-[#1D2130]'
              }`}
              onClick={() => selectMediaItem(item.id)}
            >
              <div className="flex items-center space-x-3">
                {item.type === 'video' && <Film className="h-5 w-5 text-blue-400" />}
                {item.type === 'image' && <Image className="h-5 w-5 text-green-400" />}
                {item.type === 'audio' && <Music className="h-5 w-5 text-yellow-400" />}
                <div className="flex-1 overflow-hidden">
                  <div className="text-sm font-medium truncate">{item.name}</div>
                  <div className="text-xs text-zinc-400">{item.duration}s</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MediaPanel;

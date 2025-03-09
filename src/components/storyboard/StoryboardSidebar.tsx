
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Settings, FileCode, Shirt, Mic, Music, Play, Trash2 } from 'lucide-react';

const StoryboardSidebar = () => {
  const [openSections, setOpenSections] = React.useState({
    location: true,
    style: true,
    clothing: true,
    sound: true
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-72 bg-[#0B0D14] border-r border-[#1D2130] text-white h-full">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[#2F7BBC] mb-2">RETURN TO ELDRIDGE</h2>
            <p className="text-zinc-400 text-sm mb-8">
              Sarah Thompson returns to Eldridge, evoking nostalgia as she steps into her childhood town.
            </p>
          </div>

          <Collapsible
            open={openSections.location}
            onOpenChange={() => toggleSection('location')}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Settings className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Location</h3>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4">
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
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.style}
            onOpenChange={() => toggleSection('style')}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <FileCode className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Style</h3>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div>
                <p className="text-xs text-zinc-500 uppercase mb-2">Video Style</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-purple-600 border-purple-500 text-white hover:bg-purple-700"
                  >
                    Standard
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[#141824] border-[#2D3343] text-white hover:bg-purple-700"
                  >
                    Cinematic
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[#141824] border-[#2D3343] text-white hover:bg-purple-700"
                  >
                    Film Noir
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[#141824] border-[#2D3343] text-white hover:bg-purple-700"
                  >
                    Anime
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.clothing}
            onOpenChange={() => toggleSection('clothing')}
            className="space-y-4"
          >
            <CollapsibleTrigger asChild>
              <div className="flex items-center gap-2 mb-4 cursor-pointer">
                <Shirt className="w-5 h-5 text-zinc-500" />
                <h3 className="text-zinc-200 font-medium">Clothing</h3>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="bg-[#141824] p-4 rounded-md border border-[#2D3343]">
                <p className="text-zinc-400 text-sm mb-2">No clothing items added yet</p>
                <Button variant="outline" size="sm" className="w-full mt-2 border-dashed border-zinc-600 text-zinc-400">
                  + Add Clothing Item
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible
            open={openSections.sound}
            onOpenChange={() => toggleSection('sound')}
            className="pt-4 border-t border-[#1D2130]"
          >
            <CollapsibleTrigger asChild>
              <h3 className="text-zinc-200 font-medium mb-4 cursor-pointer">Sound</h3>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6">
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
                  <div className="flex gap-2">
                    <button className="text-zinc-400 hover:text-zinc-200">
                      <Play className="w-4 h-4" />
                    </button>
                    <button className="text-zinc-400 hover:text-zinc-200">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
            </CollapsibleContent>
          </Collapsible>
        </div>
      </ScrollArea>
    </div>
  );
};

export default StoryboardSidebar;

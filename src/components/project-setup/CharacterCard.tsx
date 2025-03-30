
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface Character {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
}

interface CharacterCardProps {
  character: Character;
  onEdit: (character: Character) => void;
  onDelete: (characterId: string) => void;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character, onEdit, onDelete }) => {
  return (
    <Card className="bg-[#18191E] border border-zinc-700 w-56 aspect-[3/4] flex flex-col overflow-hidden hover:border-zinc-500 transition-colors group">
      <div className="flex-1 bg-[#111319] flex items-center justify-center relative">
        {character.image_url ? (
          <img
            src={character.image_url}
            alt={character.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="h-16 w-16 text-zinc-600" />
        )}
        {/* Overlay for actions */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-2 w-full" onClick={() => onEdit(character)}>
            <Edit className="w-4 h-4 mr-2" /> Edit
          </Button>
          {/* Future: Button for AI Image Gen */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 mb-2 w-full" disabled>
                  <ImageIcon className="w-4 h-4 mr-2" /> Generate Image
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Coming soon</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button variant="destructive" size="sm" className="bg-red-700/80 hover:bg-red-600 w-full" onClick={() => onDelete(character.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>
      <CardContent className="p-3 bg-[#18191E]">
        <h3 className="font-medium text-white truncate">{character.name}</h3>
        <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
          {character.description || 'No description provided.'}
        </p>
      </CardContent>
    </Card>
  );
};

export default CharacterCard;


import React from 'react';
import { Sparkles, MessageSquare, Database, Mic } from 'lucide-react';

interface TechLogoIconProps {
  type: 'anthropic' | 'lovable' | 'supabase' | 'elevenlabs';
}

export const TechLogoIcon = ({ type }: TechLogoIconProps) => {
  const getIcon = () => {
    switch (type) {
      case 'anthropic':
        return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'lovable':
        return <MessageSquare className="w-6 h-6 text-rose-400" />;
      case 'supabase':
        return <Database className="w-6 h-6 text-emerald-400" />;
      case 'elevenlabs':
        return <Mic className="w-6 h-6 text-blue-400" />;
    }
  };

  const getName = () => {
    switch (type) {
      case 'anthropic':
        return 'Anthropic';
      case 'lovable':
        return 'Lovable';
      case 'supabase':
        return 'Supabase';
      case 'elevenlabs':
        return 'ElevenLabs';
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/5 rounded-full p-3 mb-2">
        {getIcon()}
      </div>
      <span className="text-xs text-zinc-500">{getName()}</span>
    </div>
  );
};

export default TechLogoIcon;

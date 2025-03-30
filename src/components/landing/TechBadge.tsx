
import React from 'react';
import { cn } from '@/lib/utils';

interface TechBadgeProps {
  icon: React.ReactNode;
  name: string;
  description: string;
  color: string;
}

export const TechBadge = ({ icon, name, description, color }: TechBadgeProps) => {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors">
      <div className={cn("flex items-center justify-center", color)}>
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-white">{name}</span>
        <span className="text-xs text-zinc-400">{description}</span>
      </div>
    </div>
  );
};

export default TechBadge;

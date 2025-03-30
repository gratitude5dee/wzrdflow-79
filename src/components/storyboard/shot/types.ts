
import { ShotDetails, ImageStatus } from '@/types/storyboardTypes';

export interface ShotCardProps {
  shot: ShotDetails;
  onUpdate: (updates: Partial<ShotDetails>) => Promise<void>;
  onDelete: () => Promise<void>;
}

export interface ShotFormValues {
  shotType: string | null;
  promptIdea: string | null;
  dialogue: string | null;
  soundEffects: string | null;
  visualPrompt: string | null;
}

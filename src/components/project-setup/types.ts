
export type ProjectSetupTab = 'concept' | 'storyline' | 'settings' | 'breakdown';

export interface ProjectData {
  title: string;
  concept: string;
  genre: string;
  tone: string;
  format: string;
  customFormat?: string;
  specialRequests?: string;
  addVoiceover: boolean;
  // Commercial-specific fields
  product?: string;
  targetAudience?: string;
  mainMessage?: string;
  callToAction?: string;
  // Additional field to track AI or manual mode
  conceptOption: 'ai' | 'manual';
}

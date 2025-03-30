
// Add any missing types to this file. If the file exists, this will append the types.

// Image status to track generation progress
export type ImageStatus = 'pending' | 'prompt_ready' | 'generating' | 'completed' | 'failed';

export interface ShotDetails {
  id: string;
  scene_id: string;
  project_id: string;
  shot_number: number;
  shot_type: string | null;
  prompt_idea: string | null;
  visual_prompt: string | null;
  dialogue: string | null;
  sound_effects: string | null;
  image_url: string | null;
  image_status: ImageStatus;
  luma_generation_id: string | null;
  created_at?: string;
  updated_at?: string;
}

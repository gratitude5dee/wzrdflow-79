
export interface ProjectDetails {
  id: string;
  title: string;
  description: string | null;
  video_style: string | null;
  // Add other relevant project settings as needed
}

export interface SceneDetails {
  id: string;
  scene_number: number;
  title: string | null;
  description: string | null;
  location: string | null;
  lighting: string | null;
  weather: string | null;
  project_id: string;
}

export interface CharacterDetails {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
}

export type ImageStatus = 'pending' | 'generating' | 'completed' | 'failed';

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
}

// Interface for data needed by StoryboardSidebar
export interface SidebarData {
  projectTitle: string;
  projectDescription: string | null;
  sceneDescription: string | null;
  sceneLocation: string | null;
  sceneLighting: string | null;
  sceneWeather: string | null;
  videoStyle: string | null;
  characters: CharacterDetails[];
}

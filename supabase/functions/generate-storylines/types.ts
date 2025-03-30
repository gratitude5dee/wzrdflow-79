
// Interfaces for request/response data

export interface StorylineRequestBody {
  project_id: string;
  generate_alternative?: boolean;
}

// Interfaces for AI Responses
export interface StorylineResponseData {
  primary_storyline: {
    title: string;
    description: string;
    tags: string[];
    full_story: string;
  };
  scene_breakdown?: {
    scene_number: number;
    title: string;
    description: string;
    location?: string | null;
    lighting?: string | null;
    weather?: string | null;
  }[];
}

export interface AnalysisResponseData {
  characters: {
    name: string;
    description: string;
  }[];
  setting_keywords?: string[];
  potential_genre?: string;
  potential_tone?: string;
}

export interface StorylineGenerationResult {
  success: boolean;
  storyline_id?: string;
  scene_count?: number;
  character_count?: number;
  is_alternative?: boolean;
  updated_settings?: string[];
  potential_genre?: string;
  potential_tone?: string;
  error?: string;
}

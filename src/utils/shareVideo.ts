
import { supabase } from '@/integrations/supabase/client';
import { nanoid } from 'nanoid';

export interface ShareVideoParams {
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  projectId: string;
  metadata?: Record<string, any>;
}

export async function shareVideo(params: ShareVideoParams): Promise<string> {
  try {
    // Get current session to verify user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('You must be logged in to share videos');
    }

    // Generate a unique share ID
    const shareId = nanoid(10);
    
    // Insert into the shared_videos table
    const { data, error } = await supabase
      .from('shared_videos')
      .insert({
        share_id: shareId,
        title: params.title,
        description: params.description,
        video_url: params.videoUrl,
        thumbnail_url: params.thumbnailUrl,
        user_id: session.user.id,
        project_id: params.projectId,
        metadata: params.metadata || {},
      })
      .select('share_id')
      .single();

    if (error) {
      console.error('Error sharing video:', error);
      throw new Error(error.message || 'Failed to share video');
    }

    return data.share_id;

  } catch (error) {
    console.error('Share video failed:', error);
    throw error;
  }
}

export async function fetchSharedVideo(shareId: string) {
  try {
    const { data, error } = await supabase
      .from('shared_videos')
      .select('*')
      .eq('share_id', shareId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching shared video:', error);
      throw new Error('Failed to fetch shared video');
    }

    return data;
  } catch (error) {
    console.error('Fetch shared video failed:', error);
    throw error;
  }
}

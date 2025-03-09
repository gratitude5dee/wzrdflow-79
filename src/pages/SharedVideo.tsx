
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchSharedVideo } from '@/utils/shareVideo';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface SharedVideoData {
  title: string;
  description?: string;
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

const SharedVideo = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [videoData, setVideoData] = useState<SharedVideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedVideo = async () => {
      if (!shareId) return;

      try {
        setLoading(true);
        const data = await fetchSharedVideo(shareId);
        setVideoData(data);
      } catch (err) {
        console.error('Error loading shared video:', err);
        setError('Failed to load the shared video. It may have been removed or the link is invalid.');
      } finally {
        setLoading(false);
      }
    };

    loadSharedVideo();
  }, [shareId]);

  const handleDownload = async () => {
    if (!videoData?.video_url) return;
    
    try {
      // Use our download function via the edge function
      const downloadUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download?url=${encodeURIComponent(videoData.video_url)}`;
      
      // Open in a new tab
      window.open(downloadUrl, '_blank');
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D16] text-white p-6">
        <div className="animate-spin w-8 h-8 border-t-2 border-blue-500 rounded-full mb-4"></div>
        <p>Loading shared video...</p>
      </div>
    );
  }

  if (error || !videoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D16] text-white p-6">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-center mb-6">{error || 'Failed to load the shared video.'}</p>
        <Button onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D16] text-white">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{videoData.title}</h1>
          {videoData.description && (
            <p className="text-zinc-400">{videoData.description}</p>
          )}
          <p className="text-sm text-zinc-500 mt-2">
            Shared on {new Date(videoData.created_at).toLocaleDateString()}
          </p>
        </header>

        <div className="mb-8">
          {videoData.video_url ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                className="w-full h-full" 
                controls 
                poster={videoData.thumbnail_url}
                src={videoData.video_url}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : videoData.thumbnail_url ? (
            <div className="aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              <img 
                src={videoData.thumbnail_url} 
                alt={videoData.title} 
                className="max-w-full max-h-full"
              />
            </div>
          ) : (
            <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center">
              <p>No preview available</p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          {videoData.video_url && (
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download Video
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedVideo;

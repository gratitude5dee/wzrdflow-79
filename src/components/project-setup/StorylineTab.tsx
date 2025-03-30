
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RefreshCw, Loader2 } from 'lucide-react';
import { type ProjectData } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

interface StorylineTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

interface Storyline {
  id: string;
  title: string;
  description: string;
  tags: string[];
  full_story: string;
  is_selected: boolean;
}

const StorylineTab = ({ projectData, updateProjectData }: StorylineTabProps) => {
  const [characterCount, setCharacterCount] = useState(0);
  const [selectedStoryline, setSelectedStoryline] = useState<Storyline | null>(null);
  const [storylines, setStorylines] = useState<Storyline[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const { id: projectId } = useParams();

  // Fetch storylines when component mounts
  useEffect(() => {
    if (projectId) {
      fetchStorylines();
    }
  }, [projectId]);

  const fetchStorylines = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('storylines')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setStorylines(data);
        
        // Find and set the selected storyline if any
        const selected = data.find(s => s.is_selected);
        if (selected) {
          setSelectedStoryline(selected);
          setCharacterCount(selected.full_story.length);
        } else {
          // If none is selected, default to the first one
          setSelectedStoryline(data[0]);
          setCharacterCount(data[0].full_story.length);
        }
      }
    } catch (error) {
      console.error("Error fetching storylines:", error);
      toast.error("Failed to load storylines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStorylineChange = async (storyline: Storyline) => {
    try {
      setSelectedStoryline(storyline);
      setCharacterCount(storyline.full_story.length);

      // Update the is_selected flag in the database
      const { error } = await supabase
        .from('storylines')
        .update({ is_selected: true })
        .eq('id', storyline.id);

      if (error) {
        throw error;
      }

      // Update locally
      setStorylines(storylines.map(s => ({
        ...s,
        is_selected: s.id === storyline.id
      })));

    } catch (error) {
      console.error("Error updating selected storyline:", error);
      toast.error("Failed to select storyline");
    }
  };

  const handleGenerateMore = async () => {
    if (!projectId || !user) {
      toast.error("Cannot generate storylines: missing project ID or user not logged in");
      return;
    }

    try {
      setIsGenerating(true);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session found');
      }

      // Call our edge function
      const { data, error } = await supabase.functions.invoke('generate-storylines', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: { project_id: projectId }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.success) {
        toast.success(`Generated ${data.total} new storylines`);
        await fetchStorylines(); // Refresh storylines list
      } else {
        throw new Error(data.error || 'Failed to generate storylines');
      }
    } catch (error) {
      console.error("Error generating storylines:", error);
      toast.error("Failed to generate storylines");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Project title and tags */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{projectData.title || 'Untitled Project'}</h1>
          <div className="flex gap-2 flex-wrap">
            {projectData.format && (
              <Badge className="bg-black text-white hover:bg-zinc-800">
                {projectData.format === 'custom' 
                  ? projectData.customFormat 
                  : projectData.format.charAt(0).toUpperCase() + projectData.format.slice(1)}
              </Badge>
            )}
            {projectData.genre && (
              <Badge className="bg-black text-white hover:bg-zinc-800">{projectData.genre}</Badge>
            )}
            {projectData.tone && (
              <Badge className="bg-black text-white hover:bg-zinc-800">{projectData.tone}</Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Alternative Storylines - Now on the left */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold uppercase">Alternative Storylines</h2>
              
              <Button 
                variant="outline" 
                className="bg-blue-950 border-blue-900 text-blue-400 hover:bg-blue-900"
                onClick={handleGenerateMore}
                disabled={isGenerating}
                size="sm"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate more
                  </>
                )}
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
              </div>
            ) : storylines.length === 0 ? (
              <div className="text-center py-8 text-zinc-400">
                <p>No storylines yet.</p>
                <p className="mt-2">Click "Generate more" to create storylines based on your concept.</p>
              </div>
            ) : (
              storylines.map((storyline) => (
                <Card 
                  key={storyline.id}
                  className={`bg-black border-zinc-800 p-4 cursor-pointer hover:border-zinc-700 transition-colors ${
                    selectedStoryline?.id === storyline.id ? 'border-blue-500' : ''
                  }`}
                  onClick={() => handleStorylineChange(storyline)}
                >
                  <h3 className="font-medium mb-2">{storyline.title}</h3>
                  <p className="text-sm text-zinc-400 mb-3">{storyline.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {storyline.tags && storyline.tags.map((tag, tagIndex) => (
                      <Badge 
                        key={tagIndex} 
                        className="bg-zinc-900 text-xs text-zinc-400"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Main Storyline Editor - Now spans 2 columns */}
          <div className="md:col-span-2">
            <div className="bg-black rounded-lg border border-zinc-800 p-6">
              {selectedStoryline ? (
                <>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-zinc-300 whitespace-pre-line">
                      {selectedStoryline.full_story}
                    </p>
                  </div>
                  <div className="mt-4 text-right text-sm text-zinc-500">
                    {characterCount} characters
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <p>No storyline selected.</p>
                  {storylines.length > 0 ? (
                    <p className="mt-2">Select a storyline from the left panel to view it.</p>
                  ) : (
                    <p className="mt-2">Generate storylines to get started.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorylineTab;

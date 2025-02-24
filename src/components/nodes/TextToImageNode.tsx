
import { memo, useState } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { X, CircleDashed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { SUPABASE_URL } from '@/integrations/supabase/client';

interface TextToImageNodeProps {
  id?: string;
  data: {
    label?: string;
  };
}

type AspectRatioOption = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";
type StyleOption = "auto" | "general" | "realistic" | "design" | "render_3D" | "anime";

const ASPECT_RATIOS: AspectRatioOption[] = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3"];
const STYLES: StyleOption[] = ["auto", "general", "realistic", "design", "render_3D", "anime"];

const TextToImageNode = memo(({ id, data }: TextToImageNodeProps) => {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("1:1");
  const [style, setStyle] = useState<StyleOption>("auto");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { deleteElements } = useReactFlow();
  const { toast } = useToast();

  const handleDelete = () => {
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      // First request to initiate generation
      const response = await fetch(`${SUPABASE_URL}/functions/v1/fal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: 'fal-ai/ideogram/v2',
          input: {
            prompt,
            negative_prompt: negativePrompt,
            aspect_ratio: aspectRatio,
            style,
            expand_prompt: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      
      if (data.requestId) {
        // If we got a requestId, we need to poll for the result
        let attempts = 0;
        const maxAttempts = 30;
        
        while (attempts < maxAttempts) {
          const pollResponse = await fetch(`${SUPABASE_URL}/functions/v1/fal-poll`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requestId: data.requestId,
            }),
          });

          if (!pollResponse.ok) {
            throw new Error('Failed to check generation status');
          }

          const pollData = await pollResponse.json();
          
          if (pollData.status === 'COMPLETED' && pollData.result?.images?.[0]?.url) {
            setGeneratedImage(pollData.result.images[0].url);
            break;
          } else if (pollData.status === 'FAILED') {
            throw new Error('Image generation failed');
          }

          // Wait 2 seconds before next poll
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }

        if (attempts >= maxAttempts) {
          throw new Error('Generation timed out');
        }
      } else if (data.images?.[0]?.url) {
        // Direct response with image
        setGeneratedImage(data.images[0].url);
      } else {
        throw new Error('No image URL received');
      }

      toast({
        title: "Success",
        description: "Image generated successfully",
      });
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to generate image',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-[600px] bg-black/90 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50">
        <h3 className="text-white font-medium">{data.label || 'Text to Image'}</h3>
        <button 
          onClick={handleDelete}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Image Preview */}
        <div className="aspect-square bg-zinc-900 rounded-lg overflow-hidden">
          {generatedImage ? (
            <img 
              src={generatedImage} 
              alt="Generated" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              {error ? (
                <span className="text-red-500 text-sm px-4 text-center">{error}</span>
              ) : (
                'Generated image will appear here...'
              )}
            </div>
          )}
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-zinc-400">Style</label>
            <Select value={style} onValueChange={(value) => setStyle(value as StyleOption)}>
              <SelectTrigger className="w-full bg-zinc-900 text-white border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STYLES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-400">Aspect Ratio</label>
            <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatioOption)}>
              <SelectTrigger className="w-full bg-zinc-900 text-white border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ASPECT_RATIOS.map((ratio) => (
                  <SelectItem key={ratio} value={ratio}>{ratio}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-24 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none border border-zinc-800 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Negative Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Negative Prompt (Optional)</label>
          <Textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="Elements to avoid in the generated image..."
            className="w-full h-24 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none border border-zinc-800 focus:border-teal-500 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-zinc-900/30">
        <div className="flex items-center gap-2">
          <Button className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-lg">
            <div className="w-4 h-4 border-2 border-zinc-600 rounded-sm" />
          </Button>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={!prompt || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <CircleDashed className="w-4 h-4 animate-spin" />
              <span>Generate (~10s)</span>
            </>
          ) : (
            'Generate'
          )}
        </Button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

TextToImageNode.displayName = 'TextToImageNode';

export default TextToImageNode;

import { memo, useState, useEffect } from 'react';
import { Handle, Position, useReactFlow } from 'reactflow';
import { X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';
import { models, ModelType } from '@/types/modelTypes';
import { generateText } from '@/services/textGeneration';
import { useAuth } from "@/providers/AuthProvider";

interface TextToTextNodeProps {
  id?: string;
  data: {
    label?: string;
  };
}

const TextToTextNode = memo(({ id, data }: TextToTextNodeProps) => {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(models[0].value);
  const { toast } = useToast();
  const { user } = useAuth();
  const { deleteElements } = useReactFlow();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please ensure you're logged in to use the AI features.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === 'ResizeObserver loop limit exceeded') {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleDelete = () => {
    if (id) {
      deleteElements({ nodes: [{ id }] });
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setOutput('');

    if (!user) {
      setError('Please log in to use the AI features');
      setIsGenerating(false);
      toast({
        title: "Authentication Required",
        description: "Please log in to use the AI features.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateText(prompt, selectedModel);
      setOutput(result.data?.output || result.output || 'No output received.');
    } catch (err: any) {
      console.error('Error during generation:', err);
      const errorMessage = err.message || 'Failed to generate text. Please try again.';
      setError(errorMessage);
      
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-[600px] bg-black/90 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50">
        <h3 className="text-white font-medium">{data.label || 'Text to Text'}</h3>
        <button 
          onClick={handleDelete}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Model</label>
          <Select
            value={selectedModel}
            onValueChange={(value: ModelType) => setSelectedModel(value)}
          >
            <SelectTrigger className="w-full bg-zinc-900 text-white border-zinc-800 focus:ring-0 focus:ring-offset-0 focus:border-teal-500">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-zinc-800">
              {models.map((model) => (
                <SelectItem
                  key={model.value}
                  value={model.value}
                  className="text-white hover:bg-zinc-800 focus:bg-zinc-800 focus:text-white"
                >
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-24 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none border border-zinc-800 focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Output</label>
          <div className="w-full min-h-[200px] bg-zinc-900 text-white text-sm p-3 rounded-lg border border-zinc-800 overflow-y-auto">
            {error ? (
              <p className="text-red-400">{error}</p>
            ) : output ? (
              output
            ) : (
              'Generated text will appear here...'
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end p-4 bg-zinc-900/30">
        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
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

TextToTextNode.displayName = 'TextToTextNode';

export default TextToTextNode;

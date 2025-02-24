
import { memo, useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { X, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import * as falApi from '@fal-ai/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/components/ui/use-toast';

interface TextToTextNodeProps {
  data: {
    label?: string;
  };
}

type ModelType = 
  | 'google/gemini-flash-1.5'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-5-haiku'
  | 'anthropic/claude-3-haiku'
  | 'google/gemini-pro-1.5'
  | 'google/gemini-flash-1.5-8b'
  | 'meta-llama/llama-3.2-1b-instruct'
  | 'meta-llama/llama-3.2-3b-instruct'
  | 'meta-llama/llama-3.1-8b-instruct'
  | 'meta-llama/llama-3.1-70b-instruct'
  | 'openai/gpt-4o-mini';

const models: { value: ModelType; label: string }[] = [
  { value: 'google/gemini-flash-1.5', label: 'google/gemini-flash-1.5' },
  { value: 'anthropic/claude-3.5-sonnet', label: 'anthropic/claude-3.5-sonnet' },
  { value: 'anthropic/claude-3-5-haiku', label: 'anthropic/claude-3-5-haiku' },
  { value: 'anthropic/claude-3-haiku', label: 'anthropic/claude-3-haiku' },
  { value: 'google/gemini-pro-1.5', label: 'google/gemini-pro-1.5' },
  { value: 'google/gemini-flash-1.5-8b', label: 'google/gemini-flash-1.5-8b' },
  { value: 'meta-llama/llama-3.2-1b-instruct', label: 'meta-llama/llama-3.2-1b-instruct' },
  { value: 'meta-llama/llama-3.2-3b-instruct', label: 'meta-llama/llama-3.2-3b-instruct' },
  { value: 'meta-llama/llama-3.1-8b-instruct', label: 'meta-llama/llama-3.1-8b-instruct' },
  { value: 'meta-llama/llama-3.1-70b-instruct', label: 'meta-llama/llama-3.1-70b-instruct' },
  { value: 'openai/gpt-4o-mini', label: 'openai/gpt-4o-mini' },
];

const TextToTextNode = memo(({ data }: TextToTextNodeProps) => {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>(models[0].value);
  const { toast } = useToast();

  // Set FAL key on component mount
  useEffect(() => {
    const falKey = localStorage.getItem('FAL_KEY');
    if (falKey) {
      falApi.fal.config({
        credentials: falKey
      });
    }
  }, []);

  useEffect(() => {
    // Suppress ResizeObserver loop limit exceeded error
    const handleError = (event: ErrorEvent) => {
      if (event.message === 'ResizeObserver loop limit exceeded') {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setError('');
    setOutput('');

    const falKey = localStorage.getItem('FAL_KEY');
    if (!falKey) {
      setError('FAL_KEY not found. Please add your API key in the settings.');
      setIsGenerating(false);
      toast({
        title: "Authentication Required",
        description: "Please set your FAL_KEY to use the text generation feature.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Ensure the API key is configured before making the request
      falApi.fal.config({
        credentials: falKey
      });

      const result = await falApi.fal.subscribe('fal-ai/any-llm', {
        input: {
          prompt: prompt,
          model: selectedModel,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'IN_PROGRESS') {
            console.log(update.logs.map((log) => log.message));
          }
        },
      });

      setOutput(result.data.output || 'No output received.');
    } catch (err: any) {
      console.error('Error:', err);
      const errorMessage = err.body?.detail || err.message || 'Failed to generate text. Please try again.';
      setError(errorMessage);
      
      // Show authentication error toast if needed
      if (err.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please verify your FAL_KEY is correct.",
          variant: "destructive",
        });
        // Clear invalid key
        localStorage.removeItem('FAL_KEY');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-[600px] bg-black/90 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-zinc-900/50">
        <h3 className="text-white font-medium">{data.label || 'Text to Text'}</h3>
        <button className="text-zinc-400 hover:text-white">
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

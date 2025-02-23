
import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { X, CircleDashed } from 'lucide-react';

interface TextToTextNodeProps {
  data: {
    label?: string;
  };
}

const TextToTextNode = memo(({ data }: TextToTextNodeProps) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    if (!inputPrompt) return;
    setIsGenerating(true);
    // TODO: Implement actual text generation
    setTimeout(() => {
      setOutputText('Generated text will appear here...');
      setIsGenerating(false);
    }, 2000);
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
          <label className="text-xs text-zinc-400">Prompt</label>
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Enter your prompt..."
            className="w-full h-24 bg-zinc-900 text-white text-sm px-3 py-2 rounded-lg resize-none focus:outline-none border border-zinc-800 focus:border-teal-500 transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-zinc-400">Output</label>
          <div className="w-full min-h-[200px] bg-zinc-900 text-white text-sm p-3 rounded-lg border border-zinc-800">
            {outputText || 'Generated text will appear here...'}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end p-4 bg-zinc-900/30">
        <button
          onClick={handleGenerate}
          disabled={!inputPrompt || isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <CircleDashed className="w-4 h-4 animate-spin" />
              <span>Generating (~10s)</span>
            </>
          ) : (
            'Generate'
          )}
        </button>
      </div>

      <Handle type="target" position={Position.Left} className="!bg-teal-500" />
      <Handle type="source" position={Position.Right} className="!bg-teal-500" />
    </div>
  );
});

TextToTextNode.displayName = 'TextToTextNode';

export default TextToTextNode;

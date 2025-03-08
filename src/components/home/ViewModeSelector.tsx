
type ViewMode = 'studio' | 'storyboard' | 'editor';

interface ViewModeSelectorProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const ViewModeSelector = ({ viewMode, setViewMode }: ViewModeSelectorProps) => {
  return (
    <div className="flex bg-zinc-900 rounded-lg border border-zinc-800 p-0.5">
      <button
        onClick={() => setViewMode('studio')}
        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
          viewMode === 'studio'
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        Studio
      </button>
      <button
        onClick={() => setViewMode('storyboard')}
        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
          viewMode === 'storyboard'
            ? 'bg-purple-800/70 text-white'
            : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        Storyboard
      </button>
      <button
        onClick={() => setViewMode('editor')}
        className={`px-4 py-1.5 text-sm rounded-md transition-colors ${
          viewMode === 'editor'
            ? 'bg-zinc-800 text-white'
            : 'text-zinc-400 hover:text-zinc-300'
        }`}
      >
        Editor
      </button>
    </div>
  );
};


import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { type ProjectData } from './ProjectSetupWizard';

interface ConceptTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

interface ExampleConcept {
  title: string;
  description: string;
}

const ConceptTab = ({ projectData, updateProjectData }: ConceptTabProps) => {
  const [conceptOption, setConceptOption] = useState<'ai' | 'manual'>('ai');

  const exampleConcepts: ExampleConcept[] = [
    {
      title: 'Veil of Mist',
      description: 'A group of adventurers discovers a utopia hidden within a fog-shrouded island and must choose between preserving its secrets or revealing it to the world.'
    },
    {
      title: 'Warbound',
      description: 'Stranded in no man\'s land, two soldiers from opposing sides form an unlikely bond as they fight for survival.'
    },
    {
      title: 'Lost in Cosmos',
      description: 'An astronaut\'s accidental journey through a wormhole leads to an alien conspiracy that threatens Earth\'s existence.'
    }
  ];

  const handleConceptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateProjectData({ concept: e.target.value });
  };

  const handleSpecialRequestsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ specialRequests: e.target.value });
  };

  const handleFormatChange = (format: string) => {
    updateProjectData({ format });
  };

  const handleCustomFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ customFormat: e.target.value });
  };

  const handleGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ genre: e.target.value });
  };

  const handleToneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ tone: e.target.value });
  };

  const handleVoiceoverToggle = () => {
    updateProjectData({ addVoiceover: !projectData.addVoiceover });
  };

  const handleUseExampleConcept = (concept: ExampleConcept) => {
    updateProjectData({ 
      title: concept.title,
      concept: concept.description 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-6">Input your concept</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className={`p-6 rounded-lg border ${conceptOption === 'ai' ? 'border-blue-600 bg-blue-950/30' : 'border-zinc-700 bg-zinc-900'} cursor-pointer`}
            onClick={() => setConceptOption('ai')}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-blue-800 rounded">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-blue-400">Develop concept with AI</h3>
                <p className="text-sm text-zinc-400">AI involvement in script editing and writing</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-6 rounded-lg border ${conceptOption === 'manual' ? 'border-zinc-600 bg-zinc-800/30' : 'border-zinc-700 bg-zinc-900'} cursor-pointer`}
            onClick={() => setConceptOption('manual')}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-zinc-700 rounded">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-medium">Stick to the script</h3>
                <p className="text-sm text-zinc-400">Visualize your idea or script as written</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border border-zinc-800/50 rounded-lg p-1 mb-6">
          <Textarea 
            value={projectData.concept}
            onChange={handleConceptChange}
            placeholder="Input anything from a full script, a few scenes, or a story..."
            className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none text-white placeholder:text-zinc-600"
          />
          <div className="flex justify-between items-center px-3 py-2 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800">
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Text
              </Button>
            </div>
            <div>0 / 12000</div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">Optional settings</h2>
          
          <div className="space-y-6">
            <div>
              <label className="flex items-center text-sm text-zinc-400 mb-2 gap-1">
                SPECIAL REQUESTS
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </label>
              <Input
                value={projectData.specialRequests || ''}
                onChange={handleSpecialRequestsChange}
                placeholder="Anything from '80s atmosphere' to 'plot twists' or 'a car chase'"
                className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">FORMAT</label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={projectData.format === 'custom' ? 'default' : 'outline'}
                  className={`rounded-full ${projectData.format === 'custom' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                  onClick={() => handleFormatChange('custom')}
                >
                  Custom
                </Button>
                <Button
                  type="button"
                  variant={projectData.format === 'short' ? 'default' : 'outline'}
                  className={`rounded-full ${projectData.format === 'short' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                  onClick={() => handleFormatChange('short')}
                >
                  Short Film
                </Button>
                <Button
                  type="button"
                  variant={projectData.format === 'commercial' ? 'default' : 'outline'}
                  className={`rounded-full ${projectData.format === 'commercial' ? 'bg-blue-600 text-white' : 'bg-transparent border-zinc-700 text-zinc-400'}`}
                  onClick={() => handleFormatChange('commercial')}
                >
                  Commercial
                </Button>
              </div>
            </div>
            
            {projectData.format === 'custom' && (
              <div>
                <label className="text-sm text-zinc-400 mb-2 block">CUSTOM FORMAT</label>
                <Input
                  value={projectData.customFormat || ''}
                  onChange={handleCustomFormatChange}
                  placeholder="How should the AI shape your story?"
                  className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                />
              </div>
            )}
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">GENRE</label>
              <Input
                value={projectData.genre}
                onChange={handleGenreChange}
                placeholder="This defines the overall style or category of your story"
                className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
              />
            </div>
            
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">TONE</label>
              <Input
                value={projectData.tone}
                onChange={handleToneChange}
                placeholder="This shapes the mood and emotional impact of your story"
                className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
              />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3">Speech</h3>
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm text-zinc-400 gap-1">
                  ADD VOICEOVER
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </label>
                <button 
                  onClick={handleVoiceoverToggle}
                  className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${projectData.addVoiceover ? 'bg-blue-600' : 'bg-zinc-700'}`}
                >
                  <span 
                    className={`block w-4 h-4 rounded-full transition-transform duration-200 ease-in-out ${projectData.addVoiceover ? 'bg-white transform translate-x-6' : 'bg-zinc-400'}`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Examples section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">EXAMPLES</h2>
          <Button variant="ghost" size="sm" className="text-zinc-400">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {exampleConcepts.map((example, index) => (
            <div 
              key={index} 
              className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
              onClick={() => handleUseExampleConcept(example)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{example.title}</h3>
                <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">LOGLINE</span>
              </div>
              <p className="text-sm text-zinc-400">{example.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConceptTab;

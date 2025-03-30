import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RefreshCw, FileText } from 'lucide-react';
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
  const [conceptCharCount, setConceptCharCount] = useState(0);
  const [showCommercialOptions, setShowCommercialOptions] = useState(false);

  // Update character count when concept changes
  useEffect(() => {
    setConceptCharCount(projectData.concept ? projectData.concept.length : 0);
  }, [projectData.concept]);

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
    // Show commercial options only when commercial format is selected
    setShowCommercialOptions(format === 'commercial');
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

  // Handle commercial-specific field changes
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ product: e.target.value });
  };

  const handleTargetAudienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ targetAudience: e.target.value });
  };

  const handleMainMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ mainMessage: e.target.value });
  };

  const handleCallToActionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateProjectData({ callToAction: e.target.value });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-6 text-white">Input your concept</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div 
            className={`p-6 rounded-lg border ${conceptOption === 'ai' ? 'border-blue-600 bg-[#080C1A]' : 'border-zinc-700 bg-zinc-900'} cursor-pointer`}
            onClick={() => setConceptOption('ai')}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-[#111525] rounded">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${conceptOption === 'ai' ? 'text-blue-400' : 'text-white'}`}>Develop concept with AI</h3>
                <p className="text-sm text-zinc-400">AI involvement in script editing and writing</p>
              </div>
            </div>
          </div>
          
          <div 
            className={`p-6 rounded-lg border ${conceptOption === 'manual' ? 'border-blue-600 bg-[#080C1A]' : 'border-zinc-700 bg-zinc-900'} cursor-pointer`}
            onClick={() => setConceptOption('manual')}
          >
            <div className="flex items-start gap-3 mb-2">
              <div className="p-2 bg-[#111525] rounded">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className={`text-lg font-medium ${conceptOption === 'manual' ? 'text-blue-400' : 'text-white'}`}>Stick to the script</h3>
                <p className="text-sm text-zinc-400">Visualize your idea or script as written</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="border border-zinc-800/50 rounded-lg p-1 mb-6">
              <Textarea 
                value={projectData.concept}
                onChange={handleConceptChange}
                placeholder="Input anything from a full script, a few scenes, or a story..."
                className="min-h-[200px] bg-transparent border-none focus-visible:ring-0 resize-none text-white placeholder:text-zinc-600"
              />
              <div className="flex justify-between items-center px-3 py-2 text-sm text-zinc-500">
                <Button variant="outline" size="sm" className="h-8 px-3 bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800">
                  <FileText className="h-4 w-4 mr-2" />
                  Upload Text
                </Button>
                <div>{conceptCharCount} / 12000</div>
              </div>
            </div>
          </div>
          
          {/* Examples section (moved to the right side) */}
          <div className="w-full md:w-[300px]">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-white">EXAMPLES</h2>
                <Button variant="ghost" size="sm" className="text-zinc-400">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                {exampleConcepts.map((example, index) => (
                  <div 
                    key={index} 
                    className="bg-zinc-900 rounded-lg p-4 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
                    onClick={() => handleUseExampleConcept(example)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-white">{example.title}</h3>
                      <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400">LOGLINE</span>
                    </div>
                    <p className="text-sm text-zinc-400">{example.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4 text-white">Optional settings</h2>
          
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
            
            {/* Commercial-specific fields */}
            {showCommercialOptions && (
              <div className="border-l-2 border-blue-600 pl-4 space-y-4">
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">PRODUCT / SERVICE</label>
                  <Input
                    value={projectData.product || ''}
                    onChange={handleProductChange}
                    placeholder="What are you advertising?"
                    className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">TARGET AUDIENCE</label>
                  <Input
                    value={projectData.targetAudience || ''}
                    onChange={handleTargetAudienceChange}
                    placeholder="Who are you advertising to?"
                    className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">MAIN MESSAGE</label>
                  <Input
                    value={projectData.mainMessage || ''}
                    onChange={handleMainMessageChange}
                    placeholder="What do you want your audience to remember?"
                    className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-zinc-400 mb-2 block">CALL TO ACTION</label>
                  <Input
                    value={projectData.callToAction || ''}
                    onChange={handleCallToActionChange}
                    placeholder="What do you want your audience to do?"
                    className="w-full bg-zinc-900 border-zinc-800 text-white focus-visible:ring-zinc-700"
                  />
                </div>
              </div>
            )}
            
            {!showCommercialOptions && (
              <>
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
              </>
            )}
            
            <div>
              <h3 className="text-lg font-medium mb-3 text-white">Speech</h3>
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
    </div>
  );
};

export default ConceptTab;

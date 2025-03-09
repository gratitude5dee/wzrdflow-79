
import { Play, Share, Settings, FileCode, Users, Music, Mic } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { ViewModeSelector } from '@/components/home/ViewModeSelector';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  viewMode: 'studio' | 'storyboard' | 'editor';
  setViewMode: (mode: 'studio' | 'storyboard' | 'editor') => void;
}

const Header = ({ viewMode, setViewMode }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <header className="w-full bg-[#0B0D14] border-b border-[#1D2130] px-6 py-3 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-yellow-300 tracking-tight mr-2">WZRD.STUDIO</h1>
          <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
          
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
          
          <div className="flex items-center ml-8 space-x-1">
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130]">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130]">
              <FileCode className="h-4 w-4 mr-2" />
              Style
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130]">
              <Users className="h-4 w-4 mr-2" />
              Cast
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130]">
              <Music className="h-4 w-4 mr-2" />
              Soundtrack
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130]">
              <Mic className="h-4 w-4 mr-2" />
              Voiceover
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-[#1D2130] rounded-md overflow-hidden p-1">
            <Button 
              variant="ghost"
              className={`px-4 py-1 text-sm rounded ${viewMode === 'storyboard' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
              onClick={() => setViewMode('storyboard')}
            >
              STORYBOARD
            </Button>
            <Button 
              variant="ghost"
              className={`px-4 py-1 text-sm rounded ${viewMode === 'editor' ? 'bg-purple-600 text-white' : 'text-white/70 hover:text-white'}`}
              onClick={() => setViewMode('editor')}
            >
              SHOT EDITOR
            </Button>
          </div>
          
          <div className="flex items-center gap-3 ml-3">
            <Button 
              variant="ghost" 
              className="bg-transparent hover:bg-[#1D2130] border border-[#1D2130] text-white"
            >
              <span>-</span>
            </Button>
            <Button 
              variant="ghost" 
              className="bg-transparent hover:bg-[#1D2130] border border-[#1D2130] text-white"
            >
              <span>-</span>
            </Button>
            <Button 
              variant="ghost" 
              className="bg-[#1D2130] hover:bg-[#262B3D] text-white gap-2"
            >
              <Play className="w-4 h-4" />
              <span>Preview</span>
            </Button>
            <Button 
              variant="ghost" 
              className="bg-[#1D2130] hover:bg-[#262B3D] text-white gap-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;


import { Flower, Menu, LogOut, ArrowLeft, Settings, FileCode, Users, Music, Mic } from 'lucide-react';
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
    <header className="w-full bg-zinc-900/50 backdrop-blur-sm border-b border-zinc-800 px-6 py-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="text-white hover:text-teal-500 transition-colors p-1 -ml-2"
              aria-label="Back to home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Flower className="w-6 h-6 text-teal-500" />
              <h1 className="text-2xl font-bold text-amber-300 tracking-tight">WZRD.tech ALPHA</h1>
            </div>
          </div>
          <span className="text-sm text-zinc-400 mt-1">Project 001</span>
        </div>

        {viewMode === 'storyboard' && (
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-400">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-400">
              <FileCode className="h-4 w-4 mr-2" />
              Style
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-400">
              <Users className="h-4 w-4 mr-2" />
              Cast
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-400">
              <Music className="h-4 w-4 mr-2" />
              Soundtrack
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-400">
              <Mic className="h-4 w-4 mr-2" />
              Voiceover
            </Button>
          </div>
        )}

        <div className="flex items-center gap-4">
          <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />

          <div className="flex items-center gap-4 ml-4">
            <Button 
              variant="ghost" 
              className="text-white hover:text-teal-500 transition-colors flex items-center gap-2"
            >
              <span>Preview</span>
            </Button>
            <Button 
              variant="ghost" 
              className="text-white hover:text-teal-500 transition-colors flex items-center gap-2"
            >
              <span>Share</span>
            </Button>
            <button 
              onClick={handleLogout}
              className="text-white hover:text-teal-500 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
            <button className="text-white hover:text-teal-500 transition-colors">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

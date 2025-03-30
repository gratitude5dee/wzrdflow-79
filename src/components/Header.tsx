
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ViewModeSelector } from '@/components/home/ViewModeSelector';

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
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/home')}>
          <h1 className="text-xl font-bold text-yellow-300 tracking-tight mr-2">WZRD.STUDIO</h1>
          <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
        </div>
        
        <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />

        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="bg-[#1D2130] hover:bg-[#262B3D] text-white"
            onClick={handleBack}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;


import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectSetupHeader = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/home');
  };

  return (
    <header className="w-full bg-[#0B0D14] border-b border-[#1D2130] px-6 py-3 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-yellow-300 tracking-tight mr-2">WZRD.STUDIO</h1>
          <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">ALPHA</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            className="bg-[#1D2130] hover:bg-[#262B3D] text-white"
            onClick={handleBack}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Projects
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ProjectSetupHeader;

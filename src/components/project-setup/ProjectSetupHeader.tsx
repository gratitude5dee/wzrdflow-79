
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProjectSetupHeader = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/home');
  };
  
  return <header className="w-full bg-[#0B0D14] border-b border-[#1D2130] px-6 py-3 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center cursor-pointer" onClick={handleBack}>
          <h1 className="text-xl font-bold text-white tracking-tight mr-2">WZRD</h1>
          <span className="text-xs text-white/50 bg-[#292F46] px-2 py-0.5 rounded">Studio</span>
          <span className="ml-6 text-zinc-400">Visualize your concept</span>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="ghost" className="bg-transparent hover:bg-transparent text-blue-500">
            Upgrade
          </Button>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
            G
          </div>
        </div>
      </div>
    </header>;
};

export default ProjectSetupHeader;

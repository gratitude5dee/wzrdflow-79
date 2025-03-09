
import React from 'react';
import { useVideoEditor } from '@/providers/VideoEditorProvider';
import { Button } from '@/components/ui/button';
import { Settings, Save, Upload, FileExport, Cut, Copy, Undo, Redo } from 'lucide-react';

const ToolbarPanel = () => {
  const { 
    projectName, 
    setProjectName,
    openDialog 
  } = useVideoEditor();

  return (
    <div className="flex-none bg-[#0A0D16] border-b border-[#1D2130] p-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        {/* Project name */}
        <div className="flex items-center mr-4">
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="bg-transparent border-none text-white focus:outline-none text-sm font-medium"
          />
        </div>
        
        {/* File operations */}
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Upload className="h-4 w-4 mr-2" />
          Import
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-[#1D2130] h-8"
          onClick={() => openDialog('export')}
        >
          <FileExport className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Edit operations */}
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8 px-2">
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8 px-2">
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Cut className="h-4 w-4 mr-2" />
          Cut
        </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-[#1D2130] h-8">
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        
        {/* Settings */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white hover:bg-[#1D2130] h-8"
          onClick={() => openDialog('projectSettings')}
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default ToolbarPanel;


import { useState } from "react";
import { Edit, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";

interface TestStepActionsProps {
  stepId: string;
  onDeleteClick: (event: React.MouseEvent, id: string) => void;
  isExecuting: boolean;
  isReordering: boolean;
}

export function TestStepActions({ 
  stepId, 
  onDeleteClick, 
  isExecuting, 
  isReordering 
}: TestStepActionsProps) {
  
  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Editing test step ${id}`);
  };

  const handleCopy = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Copying test step ${id}`);
  };

  return (
    <div className="flex justify-end gap-2">
      <button 
        className="action-button-edit" 
        onClick={(e) => handleEdit(e, stepId)}
        disabled={isExecuting || isReordering}
      >
        <Edit className="h-4 w-4" />
      </button>
      <button 
        className="action-button-delete" 
        onClick={(e) => onDeleteClick(e, stepId)}
        disabled={isExecuting || isReordering}
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <button 
        className="action-button-audit" 
        onClick={(e) => handleCopy(e, stepId)}
        disabled={isExecuting || isReordering}
      >
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}


import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Edit, Trash2, History } from "lucide-react";
import { Module } from "@/types/project.types";

interface ModuleCardProps {
  module: Module;
  onSelect: (module: Module) => void;
  onEdit: (event: React.MouseEvent, moduleId: string) => void;
  onDelete: (event: React.MouseEvent, moduleId: string) => void;
  onAudit: (event: React.MouseEvent, moduleId: string) => void;
}

export function ModuleCard({ 
  module, 
  onSelect, 
  onEdit, 
  onDelete, 
  onAudit 
}: ModuleCardProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Card 
      className="card-content cursor-pointer hover:border-primary/50 transition-all"
      onClick={() => onSelect(module)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {module.moduleName}
        </CardTitle>
        <CardDescription>
          {module.description}
        </CardDescription>
        <CardDescription>
          Created: {formatDate(module.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${
            module.moduleStatus === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
            module.moduleStatus === "Not Started" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" :
            module.moduleStatus === "On Hold" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
            "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }`}>
            {module.moduleStatus}
          </span>
          
          <span className={`px-2 py-1 rounded-full ${
            module.modulePriority === "High" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
            module.modulePriority === "Medium" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" :
            module.modulePriority === "Low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
            "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
          }`}>
            {module.modulePriority} Priority
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Test Cases: {module.noOfTestCases || "0"}
          </span>
        </div>
        
        <TooltipProvider>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-edit"
                  onClick={(e) => onEdit(e, module.moduleId)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Module</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-delete"
                  onClick={(e) => onDelete(e, module.moduleId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Module</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-audit"
                  onClick={(e) => onAudit(e, module.moduleId)}
                >
                  <History className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View Audit Trail</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardFooter>
    </Card>
  );
}

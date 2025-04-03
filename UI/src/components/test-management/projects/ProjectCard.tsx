
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, Edit, Trash2, History } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Project } from "@/types/project.types";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: (event: React.MouseEvent, projectId: string) => void;
  onDelete: (event: React.MouseEvent, projectId: string) => void;
  onAudit: (event: React.MouseEvent, projectId: string) => void;
}

export function ProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
  onAudit
}: ProjectCardProps) {
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
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Folder className="mr-2 h-5 w-5 text-primary" />
          {project.projectName}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {project.projectDescription}
        </CardDescription>
        <CardDescription>
          Created: {formatDate(project.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-1 rounded-full ${
              project.projectStatus === "In Progress" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" :
              project.projectStatus === "Not Started" ? "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" :
              project.projectStatus === "On Hold" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" :
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
            }`}>
              {project.projectStatus}
            </span>
            
            {project.priority && (
              <span className={`px-2 py-1 rounded-full ${
                project.priority === "High" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" :
                project.priority === "Medium" ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" :
                project.priority === "Low" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" :
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
              }`}>
                {project.priority} Priority
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex items-center">
          <span className="text-xs font-semibold text-muted-foreground">
            Modules: {project.noOfModules === "" ? "0" : project.noOfModules}
          </span>
        </div>
        
        <TooltipProvider>
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-edit"
                  onClick={(e) => onEdit(e, project.projectId)}
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Project</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-delete"
                  onClick={(e) => onDelete(e, project.projectId)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete Project</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  className="action-button-audit"
                  onClick={(e) => onAudit(e, project.projectId)}
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

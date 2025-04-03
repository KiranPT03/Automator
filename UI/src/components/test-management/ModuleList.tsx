
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderPlus, ArrowLeft, Search, Edit, Trash2, History } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { Project, Module } from "@/types/project.types";
import { createModule, deleteModule, fetchProjectById } from "@/store/projects";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { ModuleForm } from "./ModuleForm";

interface ModuleListProps {
  project: Project;
  onBack: () => void;
  onSelectModule: (module: Module) => void;
}

export function ModuleList({ project, onBack, onSelectModule }: ModuleListProps) {
  const dispatch = useAppDispatch();
  const { currentProject, status } = useAppSelector(state => state.projects);
  const [modules, setModules] = useState<Module[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    if (!project.modules || project.modules.length === 0) {
      dispatch(fetchProjectById(project.projectId));
    }
  }, [dispatch, project.projectId, project.modules]);
  
  useEffect(() => {
    if (currentProject && currentProject.projectId === project.projectId && currentProject.modules) {
      setModules(currentProject.modules);
    } 
    else if (project && project.modules) {
      setModules(project.modules);
    } 
    else {
      setModules([]);
    }
  }, [project, currentProject]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredModules(modules);
    } else {
      const filtered = modules.filter(module => 
        module.moduleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredModules(filtered);
    }
  }, [searchQuery, modules]);
  
  const handleCreateModule = async (moduleData: any) => {
    try {
      await dispatch(createModule({ 
        projectId: project.projectId, 
        moduleData 
      })).unwrap();
      
      await dispatch(fetchProjectById(project.projectId)).unwrap();
      
      setIsOpen(false);
      toast.success("Module created successfully");
    } catch (error) {
      toast.error(`Failed to create module: ${error}`);
      console.error("Error creating module:", error);
    }
  };

  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Editing module ${id}`);
  };
  
  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setModuleToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!moduleToDelete) return;
    
    try {
      await dispatch(deleteModule({ 
        projectId: project.projectId, 
        moduleId: moduleToDelete 
      })).unwrap();
      
      await dispatch(fetchProjectById(project.projectId)).unwrap();
      
      toast.success("Module deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete module: ${error}`);
      console.error("Error deleting module:", error);
    } finally {
      setDeleteDialogOpen(false);
      setModuleToDelete(null);
    }
  };
  
  const handleAudit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Viewing audit trail for module ${id}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav 
        items={[
          { label: "Projects", href: "#" },
          { label: project.projectName }
        ]} 
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{project.projectName}: Modules</h2>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              New Module
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new test module to organize your test cases.
              </DialogDescription>
            </DialogHeader>
            <ModuleForm 
              onSubmit={handleCreateModule}
              onCancel={() => setIsOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search modules..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-330px)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {status !== 'loading' && filteredModules.length > 0 ? (
            filteredModules.map((module) => (
              <Card 
                key={module.moduleId} 
                className="card-content cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => onSelectModule(module)}
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
                            onClick={(e) => handleEdit(e, module.moduleId)}
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
                            onClick={(e) => handleDeleteClick(e, module.moduleId)}
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
                            onClick={(e) => handleAudit(e, module.moduleId)}
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
            ))
          ) : (
            status !== 'loading' && (
              <div className="col-span-full flex justify-center py-8 text-muted-foreground">
                {searchQuery 
                  ? "No modules found matching your search." 
                  : "No modules found. Create your first module!"}
              </div>
            )
          )}
        </div>
      </ScrollArea>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              module and all its associated test cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModuleToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

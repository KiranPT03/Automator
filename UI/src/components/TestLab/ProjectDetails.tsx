import React, { useState } from "react";
import { ArrowLeft, Plus, Layers, Pencil, Trash2, History } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardActions } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Project, Module } from "@/types/testlab";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectDetailsProps {
  project: Project;
  modules: Module[];
  setModules: any; // Using any to accommodate the Redux action
  projects: Project[];
  onBackClick: () => void;
  onSelectModule: (module: Module) => void;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ 
  project, 
  modules, 
  setModules, 
  projects,
  onBackClick, 
  onSelectModule 
}) => {
  const [newModule, setNewModule] = useState<Partial<Module>>({
    moduleStatus: "Planning",
    modulePriority: "Medium",
  });
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewModule({
      ...newModule,
      [e.target.name]: e.target.value,
      projectId: project.projectId
    });
    
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: false
      });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewModule({
      ...newModule,
      [name]: value,
      projectId: project.projectId
    });
  };

  // Handle creation of a new module
  const handleCreateModule = () => {
    const requiredFields = ['moduleName'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!newModule[field as keyof Partial<Module>]) {
        errors[field] = true;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setFieldErrors(errors);
      toast.error("Missing required fields. Please fill in all required fields.");
      return;
    }

    const createdModule: Module = {
      ...newModule as Module,
      moduleId: (modules.length + 1).toString(),
      moduleOwnerId: "201", // Default owner ID
      noOfTestCases: "0", // Start with 0 test cases
      projectId: project.projectId,
      startDate: "", // Default empty strings for removed date fields
      endDate: ""
    };

    // Update modules through Redux or local state
    if (typeof setModules === 'function') {
      // Handle both Redux action creator and direct setState function
      setModules([...modules, createdModule]);
    }
    
    const updatedProjects = projects.map(p => {
      if (p.projectId === project.projectId) {
        const currentModules = parseInt(p.noOfModules || "0");
        return {
          ...p,
          noOfModules: (currentModules + 1).toString()
        };
      }
      return p;
    });
    
    setModuleDialogOpen(false);
    setNewModule({
      moduleStatus: "Planning",
      modulePriority: "Medium",
    });
    setFieldErrors({});

    toast.success(`Module "${createdModule.moduleName}" has been created successfully.`);
  };

  const RequiredFieldLabel = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium flex items-center">
      {children}
      <span className="text-[#D946EF] ml-1">*</span>
    </label>
  );

  const handleEditModule = (e: React.MouseEvent, module: Module) => {
    e.stopPropagation();
    toast.info(`Editing module: ${module.moduleName}`);
  };

  const confirmDeleteModule = () => {
    if (moduleToDelete) {
      const updatedModules = modules.filter(m => m.moduleId !== moduleToDelete.moduleId);
      
      // Update modules through Redux or local state
      if (typeof setModules === 'function') {
        setModules(updatedModules);
      }
      
      const updatedProjects = projects.map(p => {
        if (p.projectId === project.projectId) {
          const currentModules = parseInt(p.noOfModules || "0");
          return {
            ...p,
            noOfModules: Math.max(0, currentModules - 1).toString()
          };
        }
        return p;
      });
      
      toast.success(`Module "${moduleToDelete.moduleName}" has been deleted.`);
      
      setModuleToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteModule = (e: React.MouseEvent, module: Module) => {
    e.stopPropagation();
    setModuleToDelete(module);
    setDeleteDialogOpen(true);
  };

  const handleViewAuditTrail = (e: React.MouseEvent, module: Module) => {
    e.stopPropagation();
    toast.info(`Viewing audit trail for: ${module.moduleName}`);
  };

  const renderPriorityBadge = (priority: string) => {
    let className = "";
    switch(priority) {
      case "Critical":
        className = "bg-red-100 text-red-700 border border-red-200";
        break;
      case "High":
        className = "bg-orange-100 text-orange-700 border border-orange-200";
        break;
      case "Medium":
        className = "bg-blue-100 text-blue-700 border border-blue-200";
        break;
      case "Low":
      default:
        className = "bg-green-100 text-green-700 border border-green-200";
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${className}`}>
        {priority}
      </span>
    );
  };

  return (
    <Card className="border-muted/40 shadow-md">
      <CardHeader className="flex flex-row items-center border-b pb-4 border-border/30">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{project.projectName}</CardTitle>
            {renderPriorityBadge(project.priority)}
          </div>
          <CardDescription className="mt-1">
            {project.projectDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 mt-4">
          <Card className="bg-secondary/50 border-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/20">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <span className="text-sm font-medium">{project.projectStatus}</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/20">
              <CardTitle className="text-sm">Type</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <span className="text-sm font-medium">{project.type}</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/20">
              <CardTitle className="text-sm">Platform</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <span className="text-sm font-medium">{project.platform}</span>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Modules</h3>
          <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Module
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Create New Module</DialogTitle>
                <DialogDescription>
                  Fill in the module details for project: {project.projectName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredFieldLabel htmlFor="moduleName">Module Name</RequiredFieldLabel>
                    <Input
                      id="moduleName"
                      name="moduleName"
                      value={newModule.moduleName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter module name"
                      className={fieldErrors.moduleName ? "border-[#D946EF] focus-visible:ring-[#D946EF]" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="moduleStatus" className="text-sm font-medium">Status</label>
                    <Select
                      value={newModule.moduleStatus}
                      onValueChange={(value) => handleSelectChange(value, "moduleStatus")}
                    >
                      <SelectTrigger id="moduleStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Development">In Development</SelectItem>
                        <SelectItem value="In Testing">In Testing</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="moduleDescription" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="moduleDescription"
                    name="moduleDescription"
                    value={newModule.moduleDescription || ""}
                    onChange={handleInputChange}
                    placeholder="Enter module description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="modulePriority" className="text-sm font-medium">Priority</label>
                  <Select
                    value={newModule.modulePriority}
                    onValueChange={(value) => handleSelectChange(value, "modulePriority")}
                  >
                    <SelectTrigger id="modulePriority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModuleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateModule}>
                  Create Module
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.length > 0 ? (
            modules.map((module) => (
              <Card 
                key={module.moduleId} 
                className="cursor-pointer hover:scale-[1.02] transition-all duration-300 border-muted/40 relative flex flex-col"
                onClick={() => onSelectModule(module)}
              >
                <CardHeader className="pb-2 border-b border-border/30">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{module.moduleName}</CardTitle>
                    {renderPriorityBadge(module.modulePriority)}
                  </div>
                  <CardDescription className="mt-1 line-clamp-2">
                    {module.moduleDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pt-3 flex-grow">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Status:</span>
                      <span className="font-medium">{module.moduleStatus}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Test Cases:</span>
                      <Badge variant="outline" className="bg-primary/10">
                        {module.noOfTestCases}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                
                <CardActions>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="cardAction" 
                          size="cardIcon" 
                          onClick={(e) => handleEditModule(e, module)}
                          aria-label="Edit module"
                        >
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Edit</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="cardAction" 
                          size="cardIcon" 
                          onClick={(e) => handleDeleteModule(e, module)}
                          aria-label="Delete module"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="cardAction" 
                          size="cardIcon" 
                          onClick={(e) => handleViewAuditTrail(e, module)}
                          aria-label="View audit trail"
                        >
                          <History className="h-4 w-4 text-purple-600" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Audit Trail</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardActions>
              </Card>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center h-40 border border-dashed rounded-md bg-secondary/30">
              <Layers className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No modules found</p>
              <Button 
                variant="outline" 
                className="mt-4" 
                onClick={() => setModuleDialogOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create First Module
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the module "{moduleToDelete?.moduleName}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModuleToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteModule} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ProjectDetails;

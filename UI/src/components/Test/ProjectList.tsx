import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, History, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, CardActions } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Project } from "@/types/testlab";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjectsAsync, createProjectAsync, deleteProjectAsync } from "@/store/projectSlice";

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
}

const ProjectList: React.FC<ProjectListProps> = ({ onSelectProject }) => {
  const dispatch = useAppDispatch();
  const { projects, loading, error } = useAppSelector(state => state.projects);
  
  const [newProject, setNewProject] = useState<Partial<Project>>({
    projectStatus: "Planning",
    platform: "Web",
    type: "Functional",
    priority: "Medium"
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    dispatch(fetchProjectsAsync());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
    
    if (fieldErrors[e.target.name]) {
      setFieldErrors({
        ...fieldErrors,
        [e.target.name]: false
      });
    }
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewProject({
      ...newProject,
      [name]: value
    });
  };

  const handleCreateProject = async () => {
    const requiredFields = ['projectName'];
    const errors: Record<string, boolean> = {};
    let hasErrors = false;
    
    requiredFields.forEach(field => {
      if (!newProject[field as keyof Partial<Project>]) {
        errors[field] = true;
        hasErrors = true;
      }
    });
    
    if (hasErrors) {
      setFieldErrors(errors);
      toast.error("Please fill in all required fields.");
      return;
    }

    const loadingToast = toast.loading(`Creating project "${newProject.projectName}"...`);
    
    dispatch(createProjectAsync({
      ...newProject,
      projectOwnerId: "101", // Default owner ID
    })).then((action) => {
      toast.dismiss(loadingToast);
      
      if (action.meta.requestStatus === 'fulfilled') {
        setDialogOpen(false);
        setNewProject({
          projectStatus: "Planning",
          platform: "Desktop",
          type: "Functional",
          priority: "Medium"
        });
        setFieldErrors({});
      }
    });
  };

  const RequiredFieldLabel = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className="text-sm font-medium flex items-center">
      {children}
      <span className="text-[#D946EF] ml-1">*</span>
    </label>
  );

  const handleEditProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    toast.info(`Editing project: ${project.projectName}`);
  };

  const confirmDeleteProject = async () => {
    if (projectToDelete) {
      const loadingToast = toast.loading(`Deleting project "${projectToDelete.projectName}"...`);
      
      const result = await dispatch(deleteProjectAsync(projectToDelete.projectId));
      toast.dismiss(loadingToast);
      
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success(`Project "${projectToDelete.projectName}" has been deleted.`);
      } else {
        toast.error("Failed to delete project.");
      }
      
      setProjectToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const handleViewAuditTrail = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    toast.info(`Viewing audit trail for: ${project.projectName}`);
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

  const getModuleCount = (noOfModules: string | undefined): string => {
    if (!noOfModules || noOfModules === "") {
      return "0";
    }
    return noOfModules;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (projects.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Projects</h3>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px] max-h-[85vh]">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the project details to create a new test project.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="h-[calc(85vh-180px)] pr-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <RequiredFieldLabel htmlFor="projectName">Project Name</RequiredFieldLabel>
                      <Input
                        id="projectName"
                        name="projectName"
                        value={newProject.projectName || ""}
                        onChange={handleInputChange}
                        placeholder="Enter project name"
                        className={fieldErrors.projectName ? "border-[#D946EF] focus-visible:ring-[#D946EF]" : ""}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="projectStatus" className="text-sm font-medium">Status</label>
                      <Select
                        value={newProject.projectStatus}
                        onValueChange={(value) => handleSelectChange(value, "projectStatus")}
                      >
                        <SelectTrigger id="projectStatus">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Planning">Planning</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="projectDescription" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="projectDescription"
                      name="projectDescription"
                      value={newProject.projectDescription || ""}
                      onChange={handleInputChange}
                      placeholder="Enter project description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="type" className="text-sm font-medium">Test Type</label>
                      <Select
                        value={newProject.type}
                        onValueChange={(value) => handleSelectChange(value, "type")}
                      >
                        <SelectTrigger id="type">
                          <SelectValue placeholder="Select test type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Functional">Functional</SelectItem>
                          <SelectItem value="UI">UI</SelectItem>
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="Integration">Integration</SelectItem>
                          <SelectItem value="Security">Security</SelectItem>
                          <SelectItem value="Performance">Performance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                      <Select
                        value={newProject.priority}
                        onValueChange={(value) => handleSelectChange(value, "priority")}
                      >
                        <SelectTrigger id="priority">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="platform" className="text-sm font-medium">Platform</label>
                      <Select
                        value={newProject.platform}
                        onValueChange={(value) => handleSelectChange(value, "platform")}
                      >
                        <SelectTrigger id="platform">
                          <SelectValue placeholder="Select platform" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Desktop">Desktop</SelectItem>
                          <SelectItem value="Mobile">Mobile</SelectItem>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="targetBrowser" className="text-sm font-medium">Target Browser</label>
                      <Select
                        value={newProject.targetBrowser}
                        onValueChange={(value) => handleSelectChange(value, "targetBrowser")}
                      >
                        <SelectTrigger id="targetBrowser">
                          <SelectValue placeholder="Select target browser" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Chrome">Chrome</SelectItem>
                          <SelectItem value="Firefox">Firefox</SelectItem>
                          <SelectItem value="Edge">Edge</SelectItem>
                          <SelectItem value="Safari">Safari</SelectItem>
                          <SelectItem value="All">All</SelectItem>
                          <SelectItem value="N/A">N/A</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium">URL</label>
                    <Input
                      id="url"
                      name="url"
                      value={newProject.url || ""}
                      onChange={handleInputChange}
                      placeholder="Enter project URL"
                    />
                  </div>
                </div>
              </ScrollArea>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateProject}>
                  Create Project
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col items-center justify-center border border-dashed rounded-lg p-8 h-64">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-medium">No Projects Found</h3>
            <p className="text-muted-foreground max-w-md">
              You don't have any test projects yet. Create your first project to start managing test cases.
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Projects</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] max-h-[85vh]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details to create a new test project.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(85vh-180px)] pr-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <RequiredFieldLabel htmlFor="projectName">Project Name</RequiredFieldLabel>
                    <Input
                      id="projectName"
                      name="projectName"
                      value={newProject.projectName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter project name"
                      className={fieldErrors.projectName ? "border-[#D946EF] focus-visible:ring-[#D946EF]" : ""}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="projectStatus" className="text-sm font-medium">Status</label>
                    <Select
                      value={newProject.projectStatus}
                      onValueChange={(value) => handleSelectChange(value, "projectStatus")}
                    >
                      <SelectTrigger id="projectStatus">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Planning">Planning</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="On Hold">On Hold</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="projectDescription" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={newProject.projectDescription || ""}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">Test Type</label>
                    <Select
                      value={newProject.type}
                      onValueChange={(value) => handleSelectChange(value, "type")}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select test type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Functional">Functional</SelectItem>
                        <SelectItem value="UI">UI</SelectItem>
                        <SelectItem value="API">API</SelectItem>
                        <SelectItem value="Integration">Integration</SelectItem>
                        <SelectItem value="Security">Security</SelectItem>
                        <SelectItem value="Performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                    <Select
                      value={newProject.priority}
                      onValueChange={(value) => handleSelectChange(value, "priority")}
                    >
                      <SelectTrigger id="priority">
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="platform" className="text-sm font-medium">Platform</label>
                    <Select
                      value={newProject.platform}
                      onValueChange={(value) => handleSelectChange(value, "platform")}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Desktop">Desktop</SelectItem>
                        <SelectItem value="Mobile">Mobile</SelectItem>
                        <SelectItem value="Tablet">Tablet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="targetBrowser" className="text-sm font-medium">Target Browser</label>
                    <Select
                      value={newProject.targetBrowser}
                      onValueChange={(value) => handleSelectChange(value, "targetBrowser")}
                    >
                      <SelectTrigger id="targetBrowser">
                        <SelectValue placeholder="Select target browser" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chrome">Chrome</SelectItem>
                        <SelectItem value="Firefox">Firefox</SelectItem>
                        <SelectItem value="Edge">Edge</SelectItem>
                        <SelectItem value="Safari">Safari</SelectItem>
                        <SelectItem value="All">All</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="url" className="text-sm font-medium">URL</label>
                  <Input
                    id="url"
                    name="url"
                    value={newProject.url || ""}
                    onChange={handleInputChange}
                    placeholder="Enter project URL"
                  />
                </div>
              </div>
            </ScrollArea>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateProject}>
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card 
            key={project.projectId} 
            className="cursor-pointer hover:scale-[1.02] transition-all duration-300 border-muted/40 relative flex flex-col"
            onClick={() => onSelectProject(project)}
          >
            <CardHeader className="pb-2 border-b border-border/30">
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{project.projectName}</CardTitle>
                {renderPriorityBadge(project.priority)}
              </div>
              <CardDescription className="mt-1 line-clamp-2">{project.projectDescription}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2 pt-4 flex-grow">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Status:</span>
                  <span className="font-medium">{project.projectStatus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Type:</span>
                  <span className="font-medium">{project.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Platform:</span>
                  <span className="font-medium">{project.platform}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/30 mt-auto">
              <Badge variant="outline" className="mr-2 bg-primary/10">
                {getModuleCount(project.noOfModules)} {parseInt(getModuleCount(project.noOfModules)) === 1 ? 'Module' : 'Modules'}
              </Badge>
            </CardFooter>
            
            <CardActions>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="cardAction" 
                      size="cardIcon" 
                      onClick={(e) => handleEditProject(e, project)}
                      aria-label="Edit project"
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
                      onClick={(e) => handleDeleteProject(e, project)}
                      aria-label="Delete project"
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
                      onClick={(e) => handleViewAuditTrail(e, project)}
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
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the project "{projectToDelete?.projectName}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProject} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProjectList;

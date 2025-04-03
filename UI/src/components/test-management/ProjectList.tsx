import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Folder, FolderPlus, Search, Edit, Trash2, History } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProjectForm } from "./ProjectForm";
import { useAppSelector, useAppDispatch } from "@/hooks/redux-hooks";
import { Project, fetchProjects, deleteProject, fetchProjectById } from "@/store/projects";

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
}

export function ProjectList({ onSelectProject }: ProjectListProps) {
  const dispatch = useAppDispatch();
  const { projects, status, error } = useAppSelector(state => state.projects);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project => 
        project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.projectDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
  }, [searchQuery, projects]);
  
  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error);
    }
  }, [status, error]);
  
  const handleCreateProject = (data: Project) => {
    setIsOpen(false);
    toast.success(`Project ${data.projectName} created successfully`);
  };

  const handleProjectClick = async (project: Project) => {
    try {
      setIsLoadingProject(true);
      toast.info(`Loading ${project.projectName} details...`);
      
      const result = await dispatch(fetchProjectById(project.projectId)).unwrap();
      
      onSelectProject(result);
    } catch (error) {
      toast.error(`Failed to load project details: ${error}`);
      console.error("Error loading project:", error);
    } finally {
      setIsLoadingProject(false);
    }
  };

  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Editing project ${id}`);
  };
  
  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setProjectToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      await dispatch(deleteProject(projectToDelete)).unwrap();
      toast.success("Project deleted successfully");
    } catch (error) {
      toast.error("Failed to delete project");
    } finally {
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };
  
  const handleAudit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Viewing audit trail for project ${id}`);
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <FolderPlus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Add a new test project to organize your test cases.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm 
              onSubmit={handleCreateProject} 
              onCancel={() => setIsOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {status !== 'loading' && filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <Card 
                key={project.projectId} 
                className="card-content cursor-pointer hover:border-primary/50 transition-all"
                onClick={() => handleProjectClick(project)}
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
                            onClick={(e) => handleEdit(e, project.projectId)}
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
                            onClick={(e) => handleDeleteClick(e, project.projectId)}
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
                            onClick={(e) => handleAudit(e, project.projectId)}
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
                {searchQuery ? "No projects found matching your search." : "No projects found. Create your first project!"}
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
              project and all its associated test cases.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>
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


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ProjectForm } from "../ProjectForm";
import { useAppSelector, useAppDispatch } from "@/hooks/redux-hooks";
import { Project, fetchProjects, deleteProject, fetchProjectById } from "@/store/projects";
import { ProjectCard } from "./ProjectCard";
import { ProjectSearch } from "./ProjectSearch";

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
  
  // Fetch projects on component mount
  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);
  
  // Filter projects when search query changes or projects update
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
  
  // Show error toast if API request fails
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
      // Set loading state and show toast
      setIsLoadingProject(true);
      toast.info(`Loading ${project.projectName} details...`);
      
      // Fetch detailed project information
      const result = await dispatch(fetchProjectById(project.projectId)).unwrap();
      
      // Call the parent's onSelectProject with the project
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
      
      <ProjectSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-300px)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {status !== 'loading' && filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                onClick={() => handleProjectClick(project)}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAudit={handleAudit}
              />
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
      
      {/* Delete Confirmation Dialog */}
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

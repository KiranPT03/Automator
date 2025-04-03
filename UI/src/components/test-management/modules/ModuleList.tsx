
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus, ArrowLeft, Search } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { BreadcrumbNav } from "../BreadcrumbNav";
import { Project, Module } from "@/types/project.types";
import { createModule, deleteModule, fetchProjectById } from "@/store/projects/projects.thunks";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { ModuleForm } from "../ModuleForm";
import { ModuleCard } from "./ModuleCard";
import { ModuleSearch } from "./ModuleSearch";

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
      
      <ModuleSearch
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading modules...</p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-330px)]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {status !== 'loading' && filteredModules.length > 0 ? (
            filteredModules.map((module) => (
              <ModuleCard
                key={module.moduleId}
                module={module}
                onSelect={onSelectModule}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onAudit={handleAudit}
              />
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

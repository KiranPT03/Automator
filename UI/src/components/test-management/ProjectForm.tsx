import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { createProject } from "@/store/projects/projects.thunks";
import { CreateProjectPayload } from "@/types/project.types";

// Define the project schema using Zod
const projectSchema = z.object({
  projectName: z.string().min(3, { message: "Project name must be at least 3 characters long" }),
  projectDescription: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  projectStatus: z.enum(["Not Started", "In Progress", "On Hold", "Completed"]),
  projectOwnerId: z.string().optional(),
  type: z.string().min(1, { message: "Project type is required" }),
  platform: z.string().min(1, { message: "Platform is required" }),
  targetBrowser: z.string().optional(),
  url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Default values for the form
const defaultValues: Partial<ProjectFormValues> = {
  projectName: "",
  projectDescription: "",
  projectStatus: "Not Started",
  projectOwnerId: "USER-456", // Default user ID
  priority: "Medium",
  type: "Web Application", // Default type value to ensure it's not optional
  platform: "React", // Default platform value to ensure it's not optional
  targetBrowser: "",
  url: "",
};

interface ProjectFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function ProjectForm({ onSubmit, onCancel }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useAppDispatch();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const handleSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    try {
      // Create a payload with all required fields
      const projectData: CreateProjectPayload = {
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        projectStatus: data.projectStatus,
        projectOwnerId: data.projectOwnerId,
        type: data.type,
        platform: data.platform,
        targetBrowser: data.targetBrowser || "",
        url: data.url || "",
        priority: data.priority
      };
      
      // Dispatch the createProject action
      const resultAction = await dispatch(createProject(projectData));
      
      if (createProject.fulfilled.match(resultAction)) {
        // If the action was successful, call the onSubmit callback with the result
        onSubmit(resultAction.payload);
        toast.success("Project created successfully");
      } else {
        // If the action failed, show an error toast
        toast.error("Failed to create project: " + resultAction.error.message);
      }
    } catch (error) {
      toast.error("Failed to create project");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the project..."
                      className="min-h-[120px] resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Application">Web Application</SelectItem>
                        <SelectItem value="Mobile App">Mobile App</SelectItem>
                        <SelectItem value="Desktop Application">Desktop Application</SelectItem>
                        <SelectItem value="API/Service">API/Service</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="platform"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="React">React</SelectItem>
                        <SelectItem value="Angular">Angular</SelectItem>
                        <SelectItem value="Vue">Vue</SelectItem>
                        <SelectItem value="iOS">iOS</SelectItem>
                        <SelectItem value="Android">Android</SelectItem>
                        <SelectItem value="Cross-platform">Cross-platform</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetBrowser"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Browsers</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Chrome, Firefox, Safari" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="projectStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { CreateModulePayload } from "@/types/project.types";

const moduleFormSchema = z.object({
  moduleName: z.string().min(1, { message: "Module name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  moduleStatus: z.string().min(1, { message: "Status is required" }),
  modulePriority: z.string().min(1, { message: "Priority is required" }),
});

interface ModuleFormProps {
  onSubmit: (data: CreateModulePayload) => void;
  onCancel: () => void;
}

export function ModuleForm({ onSubmit, onCancel }: ModuleFormProps) {
  const form = useForm<z.infer<typeof moduleFormSchema>>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: {
      moduleName: "",
      description: "",
      moduleStatus: "Not Started",
      modulePriority: "Medium",
    },
  });

  const handleSubmit = (values: z.infer<typeof moduleFormSchema>) => {
    try {
      const moduleData: CreateModulePayload = {
        moduleName: values.moduleName,
        description: values.description,
        moduleStatus: values.moduleStatus,
        modulePriority: values.modulePriority,
      };
      
      onSubmit(moduleData);
    } catch (error) {
      toast.error("Failed to create module");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
        <FormField
          control={form.control}
          name="moduleName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Module Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter module name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="Enter module description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="moduleStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Not Started">Not Started</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="modulePriority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <DialogFooter className="pt-4">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Create Module</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

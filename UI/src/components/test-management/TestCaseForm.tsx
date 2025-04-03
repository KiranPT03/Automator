
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateTestCasePayload } from "@/types/test-case.types";

interface TestCaseFormProps {
  onSubmit: (data: CreateTestCasePayload) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TestCaseForm({ onSubmit, onCancel, isLoading = false }: TestCaseFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CreateTestCasePayload>({
    defaultValues: {
      testCaseName: "",
      testCaseStatus: "Not Run",
      description: "",
      precondition: "",
      expectedResult: "",
      priority: "Medium",
    }
  });

  // Watch values for controlled components
  const statusValue = watch("testCaseStatus");
  const priorityValue = watch("priority");

  // Handle select changes
  const handleStatusChange = (value: string) => {
    setValue("testCaseStatus", value);
  };

  const handlePriorityChange = (value: string) => {
    setValue("priority", value);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="testCaseName">Test Case Name</Label>
        <Input 
          id="testCaseName"
          {...register("testCaseName", { required: "Test case name is required" })}
          placeholder="Enter test case name"
        />
        {errors.testCaseName && (
          <p className="text-sm text-destructive">{errors.testCaseName.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            value={statusValue} 
            onValueChange={handleStatusChange}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Run">Not Run</SelectItem>
              <SelectItem value="Passed">Passed</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select 
            value={priorityValue} 
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description"
          {...register("description", { required: "Description is required" })}
          placeholder="Enter test case description"
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="precondition">Precondition</Label>
        <Textarea 
          id="precondition"
          {...register("precondition")}
          placeholder="Enter test case preconditions"
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedResult">Expected Result</Label>
        <Textarea 
          id="expectedResult"
          {...register("expectedResult", { required: "Expected result is required" })}
          placeholder="Enter expected result"
          rows={3}
        />
        {errors.expectedResult && (
          <p className="text-sm text-destructive">{errors.expectedResult.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Test Case"}
        </Button>
      </div>
    </form>
  );
}

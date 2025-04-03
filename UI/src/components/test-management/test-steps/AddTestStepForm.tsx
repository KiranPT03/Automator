
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TableCell, TableRow } from "@/components/ui/table";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { TestCase, CreateTestStepPayload } from "@/types/test-case.types";
import { toast } from "sonner";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { createTestStep, getTestCaseById } from "@/store/test-cases/test-cases.thunks";

interface AddTestStepFormProps {
  projectId: string;
  moduleId: string;
  testCaseId: string;
  isAdding: boolean;
  setIsAdding: (isAdding: boolean) => void;
  currentTestCase: TestCase | null;
  status: string;
}

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  stepData: z.string().optional(),
  stepStatus: z.string().optional(),
  order: z.string().optional(),
});

export function AddTestStepForm({ 
  projectId, 
  moduleId, 
  testCaseId, 
  isAdding, 
  setIsAdding, 
  currentTestCase, 
  status 
}: AddTestStepFormProps) {
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      stepData: "",
      stepStatus: "Not Run",
      order: currentTestCase?.testSteps?.length ? String(currentTestCase.testSteps.length + 1) : "1",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const newOrder = currentTestCase?.testSteps?.length ? String(currentTestCase.testSteps.length + 1) : "1";
      values.order = newOrder;
      
      await dispatch(createTestStep({
        projectId,
        moduleId,
        testCaseId,
        testStepData: values as CreateTestStepPayload
      })).unwrap();
      
      toast.success("Test step created successfully");
      form.reset({
        description: "",
        stepData: "",
        stepStatus: "Not Run",
        order: currentTestCase?.testSteps?.length ? String(currentTestCase.testSteps.length + 2) : "1",
      });
      setIsAdding(false);
      
      dispatch(getTestCaseById({
        projectId,
        moduleId,
        testCaseId
      }));
    } catch (error: any) {
      toast.error(`Failed to create test step: ${error}`);
      console.error("Error creating test step:", error);
    }
  };

  const cancelAddStep = () => {
    form.reset();
    setIsAdding(false);
  };

  return (
    <>
      {isAdding ? (
        <TableRow className="bg-muted/30 h-16">
          <TableCell className="align-middle">
            <div className="text-sm text-muted-foreground">
              {currentTestCase?.testSteps?.length ? String(currentTestCase.testSteps.length + 1) : "1"}
            </div>
          </TableCell>
          <TableCell>
            <Textarea 
              placeholder="Description *" 
              className="resize-none h-14"
              {...form.register("description")} 
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-500 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </TableCell>
          <TableCell>
            <Textarea 
              placeholder="Test data" 
              className="resize-none h-14"
              {...form.register("stepData")} 
            />
          </TableCell>
          <TableCell>
            <Select 
              onValueChange={(val) => form.setValue("stepStatus", val)} 
              defaultValue={form.getValues("stepStatus")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not Run">Not Run</SelectItem>
                <SelectItem value="Passed">Passed</SelectItem>
                <SelectItem value="Failed">Failed</SelectItem>
                <SelectItem value="Blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </TableCell>
          <TableCell>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={cancelAddStep}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? "Saving..." : "Add"}
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsAdding(true)}
              disabled={false}
              className="mx-auto"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Test Step
            </Button>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

import React, { useState } from "react";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Play, CheckCircle, AlertCircle, PauseCircle, Loader2, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TestCase, TestStep } from "@/types/testlab";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TestCaseDetailsProps {
  testCase: TestCase;
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  onBackClick: () => void;
}

const TestCaseDetails: React.FC<TestCaseDetailsProps> = ({ 
  testCase, 
  testCases, 
  setTestCases, 
  onBackClick 
}) => {
  const [newTestStep, setNewTestStep] = useState<Partial<TestStep>>({
    status: "Not Run"
  });
  const [editingTestStep, setEditingTestStep] = useState<TestStep | null>(null);
  const [testStepDialogOpen, setTestStepDialogOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [executionProgress, setExecutionProgress] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testStepToDelete, setTestStepToDelete] = useState<TestStep | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTestStep({
      ...newTestStep,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewTestStep({
      ...newTestStep,
      [name]: value
    });
  };

  const handleCreateTestStep = () => {
    if (!newTestStep.description || !newTestStep.expectedResult) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields"
      });
      return;
    }

    if (editingTestStep) {
      const updatedTestCases = testCases.map(tc => {
        if (tc.testCaseId === testCase.testCaseId) {
          return {
            ...tc,
            testSteps: tc.testSteps.map(step => 
              step.stepId === editingTestStep.stepId ? 
              { 
                ...step, 
                description: newTestStep.description || step.description,
                expectedResult: newTestStep.expectedResult || step.expectedResult,
                status: newTestStep.status as "Passed" | "Failed" | "Blocked" | "Not Run" || step.status
              } : step
            )
          };
        }
        return tc;
      });
      
      setTestCases(updatedTestCases);
      setEditingTestStep(null);
    } else {
      const nextStepNumber = testCase.testSteps.length 
        ? Math.max(...testCase.testSteps.map(step => step.stepNumber)) + 1 
        : 1;
      
      const createdTestStep: TestStep = {
        stepId: `${testCase.testCaseId}-${nextStepNumber}`,
        stepNumber: nextStepNumber,
        description: newTestStep.description || "",
        expectedResult: newTestStep.expectedResult || "",
        status: newTestStep.status as "Passed" | "Failed" | "Blocked" | "Not Run" || "Not Run"
      };

      const updatedTestCases = testCases.map(tc => {
        if (tc.testCaseId === testCase.testCaseId) {
          return {
            ...tc,
            testSteps: [...tc.testSteps, createdTestStep]
          };
        }
        return tc;
      });
      
      setTestCases(updatedTestCases);
    }

    setTestStepDialogOpen(false);
    setNewTestStep({
      status: "Not Run"
    });

    toast({
      title: editingTestStep ? "Test step updated" : "Test step created",
      description: editingTestStep ? 
        "The test step has been updated successfully" : 
        "New test step has been added successfully"
    });
  };

  const handleEditTestStep = (step: TestStep) => {
    setEditingTestStep(step);
    setNewTestStep({
      description: step.description,
      expectedResult: step.expectedResult,
      status: step.status
    });
    setTestStepDialogOpen(true);
  };

  const confirmDeleteTestStep = () => {
    if (testStepToDelete) {
      handleDeleteTestStep(testStepToDelete.stepId);
      setTestStepToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteTestStep = (stepId: string) => {    
    const updatedTestCases = testCases.map(tc => {
      if (tc.testCaseId === testCase.testCaseId) {
        return {
          ...tc,
          testSteps: tc.testSteps.filter(step => step.stepId !== stepId)
        };
      }
      return tc;
    });
    
    setTestCases(updatedTestCases);
    
    toast({
      title: "Test step deleted",
      description: "The test step has been deleted successfully"
    });
  };

  const executeTestCase = () => {
    if (testCase.testSteps.length === 0) {
      toast({
        variant: "destructive",
        title: "No test steps",
        description: "This test case has no steps to execute"
      });
      return;
    }

    setIsExecuting(true);
    setCurrentStepIndex(0);
    setExecutionProgress(0);

    const updatedTestCases = testCases.map(tc => {
      if (tc.testCaseId === testCase.testCaseId) {
        return {
          ...tc,
          testSteps: tc.testSteps.map(step => ({
            ...step,
            status: "Not Run" as "Passed" | "Failed" | "Blocked" | "Not Run"
          })),
          status: "In Progress"
        };
      }
      return tc;
    });
    
    setTestCases(updatedTestCases);
    
    toast({
      title: "Test execution started",
      description: `Executing test case: ${testCase.testCaseName}`
    });

    executeNextStep(0, updatedTestCases);
  };

  const executeNextStep = (index: number, currentTestCases: TestCase[]) => {
    if (index >= testCase.testSteps.length) {
      setIsExecuting(false);
      setCurrentStepIndex(-1);
      
      const updatedTestCases = currentTestCases.map(tc => {
        if (tc.testCaseId === testCase.testCaseId) {
          const hasFailedSteps = tc.testSteps.some(step => step.status === "Failed");
          const hasBlockedSteps = tc.testSteps.some(step => step.status === "Blocked");
          
          let finalStatus = "Passed";
          if (hasFailedSteps) finalStatus = "Failed";
          else if (hasBlockedSteps) finalStatus = "Blocked";
          
          return {
            ...tc,
            status: finalStatus
          };
        }
        return tc;
      });
      
      setTestCases(updatedTestCases);
      
      toast({
        title: "Test execution completed",
        description: `Test case execution completed`
      });
      
      return;
    }

    setCurrentStepIndex(index);
    
    const progressPercent = Math.round(((index + 1) / testCase.testSteps.length) * 100);
    setExecutionProgress(progressPercent);

    setTimeout(() => {
      const resultOptions: ("Passed" | "Failed" | "Blocked")[] = ["Passed", "Failed", "Blocked"];
      const randomIndex = Math.floor(Math.random() * 3);
      const result = Math.random() > 0.3 ? "Passed" : resultOptions[randomIndex];
      
      const updatedTestCases = currentTestCases.map(tc => {
        if (tc.testCaseId === testCase.testCaseId) {
          return {
            ...tc,
            testSteps: tc.testSteps.map((step, stepIndex) => 
              stepIndex === index ? { ...step, status: result as "Passed" | "Failed" | "Blocked" } : step
            )
          };
        }
        return tc;
      });
      
      setTestCases(updatedTestCases);

      executeNextStep(index + 1, updatedTestCases);
    }, 1500);
  };

  const downloadTestResults = () => {
    // Create test result data in CSV format
    const headers = "Step,Description,Expected Result,Status\n";
    const rows = testCase.testSteps
      .sort((a, b) => a.stepNumber - b.stepNumber)
      .map(step => 
        `${step.stepNumber},"${step.description.replace(/"/g, '""')}","${step.expectedResult.replace(/"/g, '""')}",${step.status}`
      )
      .join("\n");
      
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `TestCase_${testCase.testCaseId}_Results.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Results downloaded",
      description: "Test case results have been downloaded successfully"
    });
  };

  const renderStatusBadge = (status: string) => {
    let className = "";
    switch(status) {
      case "Passed":
        className = "bg-green-100 text-green-700";
        break;
      case "Failed":
        className = "bg-red-100 text-red-700";
        break;
      case "Blocked":
        className = "bg-amber-100 text-amber-700";
        break;
      case "Not Run":
      default:
        className = "bg-slate-100 text-slate-700";
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${className}`}>
        {status}
      </span>
    );
  };

  const renderPriorityBadge = (priority: string) => {
    let className = "";
    switch(priority) {
      case "Critical":
        className = "bg-red-100 text-red-700";
        break;
      case "High":
        className = "bg-orange-100 text-orange-700";
        break;
      case "Medium":
        className = "bg-blue-100 text-blue-700";
        break;
      case "Low":
      default:
        className = "bg-green-100 text-green-700";
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${className}`}>
        {priority}
      </span>
    );
  };

  const isStepCurrentlyExecuting = (stepNumber: number) => {
    return isExecuting && currentStepIndex === stepNumber - 1;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <CardTitle>{testCase.testCaseName}</CardTitle>
            {renderPriorityBadge(testCase.priority)}
          </div>
          <CardDescription className="mt-1">
            {testCase.testCaseDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              {renderStatusBadge(testCase.status)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Created</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              <span className="text-sm font-medium">
                {new Date(testCase.createdDate).toLocaleDateString()}
              </span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Expected Result</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              <span className="text-sm">{testCase.expectedResult}</span>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm">Preconditions</CardTitle>
            </CardHeader>
            <CardContent className="py-0 px-4 pb-3">
              <span className="text-sm">{testCase.preconditions}</span>
            </CardContent>
          </Card>
        </div>
        
        {isExecuting && (
          <div className="space-y-2 bg-secondary/20 p-4 rounded-md border">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                Executing step {currentStepIndex + 1} of {testCase.testSteps.length}
              </h3>
              <span className="text-sm font-medium">{executionProgress}%</span>
            </div>
            <Progress value={executionProgress} className="h-2" />
            <div className="text-sm mt-2">
              {currentStepIndex >= 0 && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">{testCase.testSteps[currentStepIndex].description}</span>
                  {testCase.testSteps[currentStepIndex].status === "Not Run" ? (
                    <PauseCircle className="h-4 w-4 text-amber-500 animate-pulse" />
                  ) : testCase.testSteps[currentStepIndex].status === "Passed" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : testCase.testSteps[currentStepIndex].status === "Failed" ? (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Test Steps</h3>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={downloadTestResults} 
                      variant="outline" 
                      size="sm"
                      disabled={testCase.testSteps.length === 0}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download Results
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Download test results as CSV</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                onClick={executeTestCase} 
                disabled={isExecuting || testCase.testSteps.length === 0}
                size="sm"
                className="flex items-center gap-1"
              >
                <Play className="h-3.5 w-3.5" />
                Run Test
              </Button>
              <Dialog open={testStepDialogOpen} onOpenChange={setTestStepDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Add Test Step
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTestStep ? "Edit Test Step" : "Add Test Step"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTestStep 
                        ? `Edit step #${editingTestStep.stepNumber} for test case: ${testCase.testCaseName}` 
                        : `Add a new test step for test case: ${testCase.testCaseName}`}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="description" className="text-sm font-medium">Step Description *</label>
                      <Textarea
                        id="description"
                        name="description"
                        value={newTestStep.description || ""}
                        onChange={handleInputChange}
                        placeholder="Enter step description"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="expectedResult" className="text-sm font-medium">Expected Result *</label>
                      <Textarea
                        id="expectedResult"
                        name="expectedResult"
                        value={newTestStep.expectedResult || ""}
                        onChange={handleInputChange}
                        placeholder="Enter expected result"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="status" className="text-sm font-medium">Status</label>
                      <Select
                        value={newTestStep.status || "Not Run"}
                        onValueChange={(value) => handleSelectChange(value, "status")}
                      >
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Passed">Passed</SelectItem>
                          <SelectItem value="Failed">Failed</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                          <SelectItem value="Not Run">Not Run</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setTestStepDialogOpen(false);
                        setEditingTestStep(null);
                        setNewTestStep({ status: "Not Run" });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="button" onClick={handleCreateTestStep}>
                      {editingTestStep ? "Update Step" : "Add Step"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {testCase.testSteps.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Step</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Expected Result</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testCase.testSteps
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map((step) => (
                    <TableRow key={step.stepId} className={isStepCurrentlyExecuting(step.stepNumber) ? "bg-amber-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isStepCurrentlyExecuting(step.stepNumber) && (
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          )}
                          {step.stepNumber}
                        </div>
                      </TableCell>
                      <TableCell>{step.description}</TableCell>
                      <TableCell>{step.expectedResult}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(step.status)}
                          {isStepCurrentlyExecuting(step.stepNumber) && step.status === "Not Run" && (
                            <span className="text-xs text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full animate-pulse">Processing</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => handleEditTestStep(step)}
                            disabled={isExecuting}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={() => {
                              setTestStepToDelete(step);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={isExecuting}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex items-center justify-center h-40 border border-dashed rounded-md">
              <div className="text-center">
                <p className="text-muted-foreground">No test steps defined</p>
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => setTestStepDialogOpen(true)}
                  size="sm"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add First Test Step
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test step? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestStepToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTestStep} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default TestCaseDetails;

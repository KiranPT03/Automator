
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Download } from "lucide-react";
import { toast } from "sonner";
import { BreadcrumbNav } from "../BreadcrumbNav";
import { Project, Module } from "@/types/project.types";
import { TestCase, TestStep, TestStepStatus } from "@/types/test-case.types";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { 
  deleteTestStep, 
  updateTestStepOrder,
  executeTestCase,
  getTestCaseById,
  getTestStepById
} from "@/store/test-cases/test-cases.thunks";
import { 
  updateStepExecutionResult, 
  startPollingTestStep, 
  stopPollingTestStep,
  resetExecutionState,
  setCurrentExecutingStepIndex
} from "@/store/test-cases/test-cases.slice";
import { TestStepTable } from "./TestStepTable";
import { TestExecutionProgress } from "./TestExecutionProgress";
import { DeleteTestStepDialog } from "./DeleteTestStepDialog";
import { testCasesApi } from "@/api/test-cases.api";

interface TestStepListProps {
  project: Project;
  module: Module;
  testCase: TestCase;
  onBack: () => void;
}

export function TestStepList({ project, module, testCase, onBack }: TestStepListProps) {
  const dispatch = useAppDispatch();
  const { 
    status, 
    error, 
    isExecuting, 
    executionResults, 
    testStepPollingIds, 
    currentExecutingStepIndex 
  } = useAppSelector(state => state.testCases);
  const currentTestCase = useAppSelector(state => state.testCases.currentTestCase);
  const [progress, setProgress] = useState(0);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [draggedStepId, setDraggedStepId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [completedStepsCount, setCompletedStepsCount] = useState(0);
  
  const pollingIntervals = useRef<Record<string, NodeJS.Timeout>>({});
  
  useEffect(() => {
    return () => {
      Object.values(pollingIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
      dispatch(resetExecutionState());
    };
  }, [dispatch]);
  
  useEffect(() => {
    Object.keys(pollingIntervals.current).forEach(stepId => {
      if (!testStepPollingIds.includes(stepId)) {
        clearInterval(pollingIntervals.current[stepId]);
        delete pollingIntervals.current[stepId];
      }
    });
    
    testStepPollingIds.forEach(stepId => {
      if (!pollingIntervals.current[stepId] && currentTestCase) {
        console.log(`Setting up polling for step ${stepId} (step index: ${currentExecutingStepIndex})`);
        
        pollingIntervals.current[stepId] = setInterval(() => {
          console.log(`Polling step ${stepId}`);
          dispatch(getTestStepById({
            projectId: project.projectId,
            moduleId: module.moduleId,
            testCaseId: currentTestCase.testCaseId,
            testStepId: stepId
          }));
        }, 3000);
      }
    });
  }, [testStepPollingIds, dispatch, project.projectId, module.moduleId, currentTestCase, currentExecutingStepIndex]);
  
  useEffect(() => {
    if (!currentTestCase?.testSteps || currentTestCase.testSteps.length === 0) {
      setProgress(0);
      setCompletedStepsCount(0);
      return;
    }

    const totalSteps = currentTestCase.testSteps.length;
    
    const completedSteps = Object.entries(executionResults).filter(([_, status]) => 
      status === TestStepStatus.PASSED || status === TestStepStatus.FAILED
    ).length;
    
    const calculatedProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    console.log(`Progress calculation: ${completedSteps} completed steps out of ${totalSteps} total = ${calculatedProgress}%`);
    console.log(`Current executing step index: ${currentExecutingStepIndex}`);
    console.log(`Execution results:`, executionResults);
    
    setCompletedStepsCount(completedSteps);
    setProgress(calculatedProgress);
  }, [executionResults, currentTestCase?.testSteps, currentExecutingStepIndex]);
  
  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setStepToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTestStep = async () => {
    if (!stepToDelete) return;
    
    try {
      await dispatch(deleteTestStep({
        projectId: project.projectId,
        moduleId: module.moduleId,
        testCaseId: testCase.testCaseId,
        testStepId: stepToDelete
      })).unwrap();
      
      toast.success("Test step deleted successfully");
      setIsDeleteDialogOpen(false);
      setStepToDelete(null);
    } catch (error: any) {
      toast.error(`Failed to delete test step: ${error}`);
      console.error("Error deleting test step:", error);
    }
  };
  
  const handleDragStart = (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => {
    setDraggedStepId(stepId);
    setIsDragging(true);
    
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      const ghostElement = document.createElement('div');
      ghostElement.style.width = '10px';
      ghostElement.style.height = '10px';
      ghostElement.style.opacity = '0.01';
      document.body.appendChild(ghostElement);
      e.dataTransfer.setDragImage(ghostElement, 5, 5);
      setTimeout(() => {
        document.body.removeChild(ghostElement);
      }, 0);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    
    if (stepId !== draggedStepId) {
      setDropTargetId(stepId);
    }
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (stepId !== draggedStepId) {
      setDropTargetId(stepId);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    
    setDropTargetId(null);
  };
  
  const handleDragEnd = () => {
    setDraggedStepId(null);
    setIsDragging(false);
    setDropTargetId(null);
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLTableRowElement>, targetStepId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedStepId || draggedStepId === targetStepId || !currentTestCase?.testSteps) {
      setDropTargetId(null);
      return;
    }
    
    const steps = [...(currentTestCase.testSteps || [])];
    const draggedIndex = steps.findIndex(step => step.stepId === draggedStepId);
    const targetIndex = steps.findIndex(step => step.stepId === targetStepId);
    
    if (draggedIndex === -1 || targetIndex === -1) {
      setDropTargetId(null);
      return;
    }
    
    const [removed] = steps.splice(draggedIndex, 1);
    steps.splice(targetIndex, 0, removed);
    
    setIsReordering(true);
    
    try {
      const updatePromises = steps.map((step, index) => 
        dispatch(updateTestStepOrder({
          projectId: project.projectId,
          moduleId: module.moduleId,
          testCaseId: testCase.testCaseId,
          testStepId: step.stepId || '',
          order: String(index + 1)
        })).unwrap()
      );
      
      for (const updatePromise of updatePromises) {
        await updatePromise;
      }
      
      toast.success("Test steps reordered successfully");
      
      await dispatch(getTestCaseById({
        projectId: project.projectId,
        moduleId: module.moduleId,
        testCaseId: testCase.testCaseId
      })).unwrap();
    } catch (error: any) {
      toast.error(`Failed to reorder test steps: ${error}`);
      console.error("Error reordering test steps:", error);
    } finally {
      setIsReordering(false);
      setIsDragging(false);
      setDraggedStepId(null);
      setDropTargetId(null);
    }
  };

  const handleRunTests = async () => {
    if (!currentTestCase?.testSteps || currentTestCase.testSteps.length === 0) {
      toast.error("No test steps to run");
      return;
    }

    try {
      dispatch(resetExecutionState());
      setProgress(0);
      setCompletedStepsCount(0);
      
      Object.values(pollingIntervals.current).forEach(interval => {
        clearInterval(interval);
      });
      pollingIntervals.current = {};
      
      const result = await dispatch(executeTestCase({
        projectId: project.projectId,
        moduleId: module.moduleId,
        testCaseId: testCase.testCaseId
      })).unwrap();
      
      console.log("Execution started, result:", result);
      
      if (result.testSteps && result.testSteps.length > 0) {
        const firstStep = result.testSteps[0];
        
        if (firstStep.stepId) {
          console.log(`Setting up initial polling for first step ${firstStep.stepId}`);
          
          dispatch(startPollingTestStep(firstStep.stepId));
          dispatch(setCurrentExecutingStepIndex(0));
          
          dispatch(updateStepExecutionResult({
            stepId: firstStep.stepId,
            status: TestStepStatus.EXECUTING
          }));
        }
      }
      
      toast.success("Test execution started");
    } catch (error: any) {
      toast.error(`Failed to execute test case: ${error}`);
      console.error("Error executing test case:", error);
    }
  };

  const handleDownloadResults = async () => {
    if (!currentTestCase?.testSteps || currentTestCase.testSteps.length === 0) {
      toast.error("No test steps to download results for");
      return;
    }
    
    if (Object.keys(executionResults).length === 0) {
      toast.warning("Run the tests first to generate results");
      return;
    }
    
    try {
      setIsDownloading(true);
      
      const { blob, filename } = await testCasesApi.downloadTestResults(
        project.projectId,
        module.moduleId,
        testCase.testCaseId
      );
      
      const contentType = blob.type;
      let fileExtension = ".csv";
      let cleanFilename = filename.replace(/"/g, '');
      
      if (contentType === "application/pdf") {
        fileExtension = ".pdf";
      } else if (contentType === "text/csv") {
        fileExtension = ".csv";
      }
      
      if (!cleanFilename.includes(".")) {
        cleanFilename += fileExtension;
      }
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', cleanFilename);
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(link);
      }, 100);
      
      toast.success("Test results downloaded successfully");
    } catch (error: any) {
      console.error("Error downloading results:", error);
      toast.error("Failed to download test results, falling back to client-side generation");
      
      try {
        let csvContent = "Step Number,Description,Test Data,Status\n";
        
        if (currentTestCase.testSteps) {
          currentTestCase.testSteps.forEach((step, index) => {
            const stepId = step.stepId || `step-${index}`;
            const status = executionResults[stepId] || step.stepStatus || "Not Run";
            
            csvContent += `${index + 1},${step.description.replace(/,/g, ";")},${(step.stepData || "").replace(/,/g, ";")},${status}\n`;
          });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${testCase.testCaseName.replace(/\s+/g, '_')}_results.csv`);
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          URL.revokeObjectURL(url);
          document.body.removeChild(link);
        }, 100);
      } catch (fallbackError) {
        console.error("Fallback download failed:", fallbackError);
        toast.error("All download attempts failed");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav
        items={[
          { label: "Projects", href: "#" },
          { label: project.projectName, href: "#" },
          { label: module.moduleName, href: "#" },
          { label: testCase.testCaseName },
        ]}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">
            {project.projectName}: {module.moduleName} - {testCase.testCaseName}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleRunTests}
            disabled={isExecuting || !currentTestCase?.testSteps || currentTestCase.testSteps.length === 0}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Play className="mr-2 h-4 w-4" />
            {isExecuting ? "Running..." : "Run Test"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleDownloadResults}
            disabled={Object.keys(executionResults).length === 0 || isDownloading}
          >
            <Download className="mr-2 h-4 w-4" />
            {isDownloading ? "Downloading..." : "Download Results"}
          </Button>
        </div>
      </div>

      <TestExecutionProgress 
        isExecuting={isExecuting}
        progress={progress}
        isReordering={isReordering}
        currentTestCase={currentTestCase}
        completedSteps={completedStepsCount}
        totalSteps={currentTestCase?.testSteps?.length || 0}
      />

      {currentTestCase && (
        <TestStepTable
          projectId={project.projectId}
          moduleId={module.moduleId}
          testCaseId={testCase.testCaseId}
          testSteps={currentTestCase.testSteps || []}
          isExecuting={isExecuting}
          executionResults={executionResults}
          testStepPollingIds={testStepPollingIds}
          status={status}
          error={error}
          currentTestCase={currentTestCase}
          isReordering={isReordering}
          isDragging={isDragging}
          draggedStepId={draggedStepId}
          dropTargetId={dropTargetId}
          handleDragStart={handleDragStart}
          handleDragOver={handleDragOver}
          handleDragEnter={handleDragEnter}
          handleDragLeave={handleDragLeave}
          handleDragEnd={handleDragEnd}
          handleDrop={handleDrop}
          handleDeleteClick={handleDeleteClick}
        />
      )}

      <DeleteTestStepDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteTestStep}
        isLoading={status === 'loading'}
      />
    </div>
  );
}

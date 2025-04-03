
import { Progress } from "@/components/ui/progress";
import { TestCase, TestStepStatus } from "@/types/test-case.types";
import { useEffect, useState } from "react";

interface TestExecutionProgressProps {
  isExecuting: boolean;
  progress: number;
  isReordering: boolean;
  currentTestCase: TestCase | null;
  completedSteps: number;
  totalSteps: number;
}

export function TestExecutionProgress({ 
  isExecuting, 
  progress, 
  isReordering, 
  currentTestCase,
  completedSteps,
  totalSteps
}: TestExecutionProgressProps) {
  const [displayProgress, setDisplayProgress] = useState(0);
  
  // Animate progress updates for smoother UI experience
  useEffect(() => {
    if (progress !== displayProgress) {
      console.log(`Setting display progress to ${progress}%, completed steps: ${completedSteps}/${totalSteps}`);
      setDisplayProgress(progress);
    }
  }, [progress, completedSteps, totalSteps, displayProgress]);

  // Calculate percentage text to display
  const percentageText = totalSteps > 0 
    ? `${completedSteps}/${totalSteps} steps (${Math.round(displayProgress)}%)`
    : `${Math.round(displayProgress)}%`;

  // Use a consistent blue color for the progress bar
  const progressColor = '#3b82f6';

  return (
    <>
      {isExecuting && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              Running test steps...
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
            </span>
            <span className="font-semibold">{percentageText}</span>
          </div>
          <Progress 
            value={displayProgress} 
            className="h-3 overflow-hidden border border-blue-100 dark:border-blue-900/30"
            color={progressColor}
          />
        </div>
      )}
      
      {currentTestCase?.executionDateTime && !isExecuting && (
        <div className="text-sm text-muted-foreground">
          Last executed: {new Date(currentTestCase.executionDateTime).toLocaleString()}
        </div>
      )}
      
      {isReordering && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-2">
              Reordering test steps...
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
            </span>
          </div>
          <Progress 
            value={50} 
            className="h-3 animate-pulse overflow-hidden border border-amber-100 dark:border-amber-900/30"
            color="#f59e0b"
          />
        </div>
      )}
    </>
  );
}

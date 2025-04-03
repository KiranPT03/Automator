
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestStepRow } from "./TestStepRow";
import { AddTestStepForm } from "./AddTestStepForm";
import { TestCase, TestStep, TestStepStatus } from "@/types/test-case.types";

interface TestStepTableProps {
  projectId: string;
  moduleId: string;
  testCaseId: string;
  testSteps: TestStep[];
  isExecuting: boolean;
  executionResults: Record<string, string>;
  testStepPollingIds: string[];
  status: string;
  error: string | null;
  currentTestCase: TestCase | null;
  isReordering: boolean;
  isDragging: boolean;
  draggedStepId: string | null;
  dropTargetId: string | null;
  handleDragStart: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  handleDragOver: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  handleDragEnter: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  handleDragLeave: (e: React.DragEvent<HTMLTableRowElement>) => void;
  handleDragEnd: () => void;
  handleDrop: (e: React.DragEvent<HTMLTableRowElement>, targetStepId: string) => void;
  handleDeleteClick: (event: React.MouseEvent, id: string) => void;
}

export function TestStepTable({
  projectId,
  moduleId,
  testCaseId,
  testSteps,
  isExecuting,
  executionResults,
  testStepPollingIds,
  status,
  error,
  currentTestCase,
  isReordering,
  isDragging,
  draggedStepId,
  dropTargetId,
  handleDragStart,
  handleDragOver,
  handleDragEnter,
  handleDragLeave,
  handleDragEnd,
  handleDrop,
  handleDeleteClick
}: TestStepTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingStep, setIsAddingStep] = useState(false);

  const filteredTestSteps = testSteps.filter(step => 
    step.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (step.stepData && step.stepData.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <style>
        {`
          .drag-indicator::before {
            content: '';
            position: absolute;
            left: 0;
            right: 0;
            height: 3px;
            background-color: hsl(var(--primary));
            z-index: 20;
          }
          
          .drag-indicator-top::before {
            top: 0;
          }
          
          .drag-indicator-bottom::before {
            bottom: 0;
          }
          
          .dragged-item {
            background-color: rgba(var(--primary), 0.1);
            outline: 2px solid hsl(var(--primary));
          }
        `}
      </style>

      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search steps..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <Alert variant="destructive" className="my-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ScrollArea className="h-[calc(100vh-400px)]">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead className="w-[40%]">Description</TableHead>
              <TableHead className="w-[40%]">Step Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {status === 'loading' && !isReordering && !isExecuting && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading test steps...
                </TableCell>
              </TableRow>
            )}
            
            {status !== 'loading' && filteredTestSteps.length === 0 && !isAddingStep && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  {searchQuery 
                    ? "No test steps match your search query." 
                    : "No test steps found for this test case. Add your first test step!"}
                </TableCell>
              </TableRow>
            )}
            
            {filteredTestSteps.map((step, index) => {
              const stepId = step.stepId || `step-${index}`;
              const isPolling = testStepPollingIds.includes(stepId);
              const executionStatus = executionResults[stepId];
              const displayStatus = executionStatus || step.stepStatus || TestStepStatus.NOT_RUN;
              
              return (
                <TestStepRow
                  key={stepId}
                  step={step}
                  index={index}
                  isExecuting={isExecuting}
                  isReordering={isReordering}
                  isPolling={isPolling}
                  displayStatus={displayStatus}
                  isDragging={isDragging}
                  draggedStepId={draggedStepId}
                  dropTargetId={dropTargetId}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragEnd={handleDragEnd}
                  onDrop={handleDrop}
                  onDeleteClick={handleDeleteClick}
                />
              );
            })}
            
            <AddTestStepForm
              projectId={projectId}
              moduleId={moduleId}
              testCaseId={testCaseId}
              isAdding={isAddingStep}
              setIsAdding={setIsAddingStep}
              currentTestCase={currentTestCase}
              status={status}
            />
          </TableBody>
        </Table>
      </ScrollArea>
    </>
  );
}

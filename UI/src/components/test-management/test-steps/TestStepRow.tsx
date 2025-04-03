
import { GripVertical } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { TestStepActions } from "./TestStepActions";
import { TestStep, TestStepStatus } from "@/types/test-case.types";
import { Badge } from "@/components/ui/badge";

interface TestStepRowProps {
  step: TestStep;
  index: number;
  isExecuting: boolean;
  isReordering: boolean;
  isPolling: boolean;
  displayStatus: string;
  isDragging: boolean;
  draggedStepId: string | null;
  dropTargetId: string | null;
  onDragStart: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  onDragEnter: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  onDragLeave: (e: React.DragEvent<HTMLTableRowElement>) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent<HTMLTableRowElement>, stepId: string) => void;
  onDeleteClick: (e: React.MouseEvent, stepId: string) => void;
}

export function TestStepRow({
  step,
  index,
  isExecuting,
  isReordering,
  isPolling,
  displayStatus,
  isDragging,
  draggedStepId,
  dropTargetId,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDragEnd,
  onDrop,
  onDeleteClick
}: TestStepRowProps) {
  const stepId = step.stepId || `step-${index}`;
  const isDraggedItem = draggedStepId === stepId;
  const isDropTarget = dropTargetId === stepId;
  
  let dragIndicatorPosition = "";
  if (isDropTarget && draggedStepId) {
    const draggedIndex = index;
    dragIndicatorPosition = draggedIndex > index ? "drag-indicator-top" : "drag-indicator-bottom";
  }

  // Get status badge variant based on test step status
  const getStatusBadgeVariant = () => {
    switch (displayStatus) {
      case TestStepStatus.PASSED:
      case "Success":
        return "success";
      case TestStepStatus.FAILED:
      case "Failed":
        return "error";
      case TestStepStatus.EXECUTING:
        return "info";
      case TestStepStatus.BLOCKED:
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <TableRow 
      draggable={!isExecuting && !isReordering}
      onDragStart={(e) => onDragStart(e, stepId)}
      onDragOver={(e) => onDragOver(e, stepId)}
      onDragEnter={(e) => onDragEnter(e, stepId)}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, stepId)}
      className={`
        relative
        ${isDragging ? 'cursor-move' : ''}
        ${isDraggedItem ? 'opacity-50 dragged-item' : ''}
        ${isDropTarget ? `drag-indicator ${dragIndicatorPosition}` : ''}
        ${isPolling && displayStatus === TestStepStatus.EXECUTING ? 'animate-pulse bg-blue-50 dark:bg-blue-900/20' : ''}
        ${(displayStatus === TestStepStatus.PASSED || displayStatus === "Success") ? 'bg-green-50 dark:bg-green-900/10' : ''}
        ${(displayStatus === TestStepStatus.FAILED || displayStatus === "Failed") ? 'bg-red-50 dark:bg-red-900/10' : ''}
      `}
    >
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          <div 
            className="cursor-move p-1 rounded hover:bg-muted"
            onMouseDown={(e) => e.preventDefault()}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          {step.order || String(index + 1)}
        </div>
      </TableCell>
      <TableCell className="break-words whitespace-pre-wrap">{step.description}</TableCell>
      <TableCell className="break-words whitespace-pre-wrap">{step.stepData || "-"}</TableCell>
      <TableCell>
        <Badge variant={getStatusBadgeVariant()} className="flex items-center gap-1 px-2 py-1">
          {displayStatus}
          {(isPolling && displayStatus === TestStepStatus.EXECUTING) && (
            <span className="inline-block h-2 w-2 rounded-full bg-white animate-ping"></span>
          )}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <TestStepActions 
          stepId={stepId} 
          onDeleteClick={onDeleteClick} 
          isExecuting={isExecuting} 
          isReordering={isReordering} 
        />
      </TableCell>
    </TableRow>
  );
}

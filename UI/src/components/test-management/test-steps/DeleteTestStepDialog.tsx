
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteTestStepDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteTestStepDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading,
}: DeleteTestStepDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete Test Step</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this test step? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Test Step'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

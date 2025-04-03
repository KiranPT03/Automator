
import { Button } from "@/components/ui/button";
import { FolderPlus, FileSearch } from "lucide-react";

export function TestSuitesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Test Suites</h2>
        <Button size="sm">
          <FolderPlus className="mr-2 h-4 w-4" />
          New Test Suite
        </Button>
      </div>
      <p className="text-muted-foreground">
        Organize your test cases into test suites. Create and manage test suites for different testing scenarios.
      </p>
      <div className="flex items-center justify-center min-h-[300px] border border-dashed rounded-md">
        <div className="text-center p-6">
          <FileSearch className="h-12 w-12 mx-auto text-muted-foreground/60" />
          <h3 className="mt-4 text-lg font-medium">No Test Suites Created</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Get started by creating your first test suite.
          </p>
          <Button className="mt-4">
            <FolderPlus className="mr-2 h-4 w-4" />
            Create Test Suite
          </Button>
        </div>
      </div>
    </div>
  );
}

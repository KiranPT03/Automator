
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Search, Edit, Trash2, Play, Copy, EyeIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { BreadcrumbNav } from "./BreadcrumbNav";
import { Project, Module } from "@/types/project.types";
import { useAppDispatch, useAppSelector } from "@/hooks/redux-hooks";
import { fetchModuleDetails, createTestCase, deleteTestCase, getTestCaseById } from "@/store/test-cases";
import { TestCase, CreateTestCasePayload } from "@/types/test-case.types";
import { TestCaseForm } from "./TestCaseForm";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface TestCaseListProps {
  project: Project;
  module: Module;
  onBack: () => void;
  onSelectTestCase: (testCase: TestCase) => void;
}

export function TestCaseList({ project, module, onBack, onSelectTestCase }: TestCaseListProps) {
  const dispatch = useAppDispatch();
  const { testCases, status, error } = useAppSelector(state => state.testCases);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filteredTestCases, setFilteredTestCases] = useState<TestCase[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<string | null>(null);
  
  // Fetch module details with test cases on component mount
  useEffect(() => {
    dispatch(fetchModuleDetails({ 
      projectId: project.projectId, 
      moduleId: module.moduleId 
    }));
  }, [dispatch, project.projectId, module.moduleId]);
  
  // Update filtered test cases when search query changes or test cases update
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTestCases(testCases);
    } else {
      const filtered = testCases.filter(testCase => 
        testCase.testCaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        testCase.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTestCases(filtered);
    }
  }, [searchQuery, testCases]);
  
  // Show error toast if API request fails
  useEffect(() => {
    if (status === 'failed' && error) {
      toast.error(error);
    }
  }, [status, error]);
  
  const handleCreateTestCase = async (testCaseData: CreateTestCasePayload) => {
    try {
      await dispatch(createTestCase({ 
        projectId: project.projectId, 
        moduleId: module.moduleId,
        testCaseData 
      })).unwrap();
      
      setIsCreateDialogOpen(false);
      toast.success("Test case created successfully");
      
      // Refresh module details to get updated test cases
      dispatch(fetchModuleDetails({ 
        projectId: project.projectId, 
        moduleId: module.moduleId 
      }));
    } catch (error) {
      toast.error(`Failed to create test case: ${error}`);
      console.error("Error creating test case:", error);
    }
  };
  
  const handleEdit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Editing test case ${id}`);
  };
  
  const handleDeleteClick = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    setTestCaseToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!testCaseToDelete) return;
    
    try {
      await dispatch(deleteTestCase({
        projectId: project.projectId,
        moduleId: module.moduleId,
        testCaseId: testCaseToDelete
      })).unwrap();
      
      toast.success("Test case deleted successfully");
    } catch (error) {
      toast.error(`Failed to delete test case: ${error}`);
      console.error("Error deleting test case:", error);
    } finally {
      setDeleteDialogOpen(false);
      setTestCaseToDelete(null);
    }
  };
  
  const handleRun = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Running test case ${id}`);
  };
  
  const handleDuplicate = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Duplicating test case ${id}`);
  };

  const handleAudit = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    toast.info(`Viewing audit trail for test case ${id}`);
  };
  
  const handleTestCaseClick = async (testCase: TestCase) => {
    try {
      // Fetch the complete test case details when a row is clicked
      await dispatch(getTestCaseById({
        projectId: project.projectId,
        moduleId: module.moduleId,
        testCaseId: testCase.testCaseId
      })).unwrap();
      
      // Pass the test case to the parent component to handle navigation
      onSelectTestCase(testCase);
    } catch (error) {
      toast.error(`Failed to get test case details: ${error}`);
      console.error("Error fetching test case details:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'N/A';
    }
  };

  const getStatusClassName = (status: string) => {
    switch(status) {
      case "Passed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Blocked":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityClassName = (priority: string) => {
    switch(priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    }
  };

  return (
    <div className="space-y-6">
      <BreadcrumbNav 
        items={[
          { label: "Projects", href: "#" },
          { label: project.projectName, href: "#" },
          { label: module.moduleName }
        ]} 
      />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold">{module.moduleName}: Test Cases</h2>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Test Case
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Test Case</DialogTitle>
              <DialogDescription>
                Add a new test case to this module.
              </DialogDescription>
            </DialogHeader>
            <TestCaseForm
              onSubmit={handleCreateTestCase}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={status === 'loading'}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search test cases..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {status === 'loading' && (
        <div className="flex justify-center py-8">
          <p className="text-muted-foreground">Loading test cases...</p>
        </div>
      )}
      
      <ScrollArea className="h-[calc(100vh-330px)]">
        <div className="table-container bg-background">
          {filteredTestCases.length > 0 ? (
            <ResizablePanelGroup direction="horizontal">
              <Table>
                <TableHeader className="table-header sticky top-0">
                  <TableRow>
                    <TableHead className="w-[20%] min-w-[150px]">Name</TableHead>
                    <TableHead className="w-[30%] min-w-[200px]">Description</TableHead>
                    <TableHead className="w-[10%] min-w-[100px]">Status</TableHead>
                    <TableHead className="w-[10%] min-w-[100px]">Priority</TableHead>
                    <TableHead className="w-[10%] min-w-[100px]">Created</TableHead>
                    <TableHead className="w-[10%] min-w-[80px]">Steps</TableHead>
                    <TableHead className="text-right w-[10%] min-w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestCases.map((testCase) => (
                    <TableRow 
                      key={testCase.testCaseId} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleTestCaseClick(testCase)}
                    >
                      <TableCell>{testCase.testCaseName}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate">{testCase.description}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClassName(testCase.testCaseStatus)}`}>
                          {testCase.testCaseStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityClassName(testCase.priority)}`}>
                          {testCase.priority}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(testCase.createdAt)}</TableCell>
                      <TableCell>{testCase.noOfTestSteps || 0}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <button className="action-button-edit" onClick={(e) => handleEdit(e, testCase.testCaseId)}>
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="action-button-delete" onClick={(e) => handleDeleteClick(e, testCase.testCaseId)}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button className="action-button-audit" onClick={(e) => handleAudit(e, testCase.testCaseId)}>
                            <EyeIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ResizablePanelGroup>
          ) : (
            status !== 'loading' && (
              <div className="flex justify-center py-8 text-muted-foreground">
                {searchQuery 
                  ? "No test cases found matching your search." 
                  : "No test cases found. Create your first test case!"}
              </div>
            )
          )}
        </div>
      </ScrollArea>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              test case and all its associated test steps.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTestCaseToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

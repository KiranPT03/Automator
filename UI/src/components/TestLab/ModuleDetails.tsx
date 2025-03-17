import React, { useState } from "react";
import { ArrowLeft, Plus, ListChecks, Pencil, Trash2, History, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardActions, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Module, TestCase } from "@/types/testlab";
import { toast } from "sonner";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ModuleDetailsProps {
  module: Module;
  testCases: TestCase[];
  setTestCases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  onBackClick: () => void;
  onSelectTestCase: (testCase: TestCase) => void;
}

const ModuleDetails: React.FC<ModuleDetailsProps> = ({ 
  module, 
  testCases, 
  setTestCases,
  modules,
  setModules, 
  onBackClick, 
  onSelectTestCase 
}) => {
  const [newTestCase, setNewTestCase] = useState<Partial<TestCase>>({
    priority: "Medium",
    status: "Draft"
  });
  const [testCaseDialogOpen, setTestCaseDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testCaseToDelete, setTestCaseToDelete] = useState<TestCase | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewTestCase({
      ...newTestCase,
      [e.target.name]: e.target.value,
      moduleId: module.moduleId
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setNewTestCase({
      ...newTestCase,
      [name]: value,
      moduleId: module.moduleId
    });
  };

  const handleCreateTestCase = () => {
    if (!newTestCase.testCaseName || !newTestCase.expectedResult) {
      toast.error("Missing required fields. Please fill in all required fields.");
      return;
    }

    const createdTestCase: TestCase = {
      ...newTestCase as TestCase,
      testCaseId: (testCases.length + 1).toString(),
      createdBy: "201", // Default creator ID
      createdDate: new Date().toISOString().split('T')[0],
      testSteps: []
    };

    setTestCases([...testCases, createdTestCase]);
    
    const updatedModules = modules.map(m => {
      if (m.moduleId === module.moduleId) {
        const currentTestCases = parseInt(m.noOfTestCases || "0");
        return {
          ...m,
          noOfTestCases: (currentTestCases + 1).toString()
        };
      }
      return m;
    });
    
    setModules(updatedModules);
    setTestCaseDialogOpen(false);
    setNewTestCase({
      priority: "Medium",
      status: "Draft"
    });

    toast.success(`Test case "${createdTestCase.testCaseName}" has been created successfully.`);
  };

  const handleEditTestCase = (e: React.MouseEvent, testCase: TestCase) => {
    e.stopPropagation();
    toast.info(`Editing test case: ${testCase.testCaseName}`);
  };

  const confirmDeleteTestCase = () => {
    if (testCaseToDelete) {
      const updatedTestCases = testCases.filter(tc => tc.testCaseId !== testCaseToDelete.testCaseId);
      setTestCases(updatedTestCases);
      
      // Update module test case count
      const updatedModules = modules.map(m => {
        if (m.moduleId === module.moduleId) {
          const currentTestCases = parseInt(m.noOfTestCases || "0");
          return {
            ...m,
            noOfTestCases: Math.max(0, currentTestCases - 1).toString()
          };
        }
        return m;
      });
      
      setModules(updatedModules);
      
      toast.success(`Test case "${testCaseToDelete.testCaseName}" has been deleted.`);
      
      setTestCaseToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteTestCase = (e: React.MouseEvent, testCase: TestCase) => {
    e.stopPropagation();
    setTestCaseToDelete(testCase);
    setDeleteDialogOpen(true);
  };

  const handleViewAuditTrail = (e: React.MouseEvent, testCase: TestCase) => {
    e.stopPropagation();
    toast.info(`Viewing audit trail for: ${testCase.testCaseName}`);
  };

  const renderPriorityBadge = (priority: string) => {
    let className = "";
    switch(priority) {
      case "Critical":
        className = "bg-red-100 text-red-700 border border-red-200";
        break;
      case "High":
        className = "bg-orange-100 text-orange-700 border border-orange-200";
        break;
      case "Medium":
        className = "bg-blue-100 text-blue-700 border border-blue-200";
        break;
      case "Low":
      default:
        className = "bg-green-100 text-green-700 border border-green-200";
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${className}`}>
        {priority}
      </span>
    );
  };

  const renderStatusBadge = (status: string) => {
    let className = "";
    switch(status) {
      case "Ready":
        className = "bg-green-100 text-green-700 border border-green-200";
        break;
      case "In Progress":
        className = "bg-blue-100 text-blue-700 border border-blue-200";
        break;
      case "Blocked":
        className = "bg-amber-100 text-amber-700 border border-amber-200";
        break;
      case "Draft":
      default:
        className = "bg-slate-100 text-slate-700 border border-slate-200";
        break;
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${className}`}>
        {status}
      </span>
    );
  };

  return (
    <Card className="border-muted/40 shadow-md">
      <CardHeader className="flex flex-row items-center border-b pb-4 border-border/30">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBackClick} 
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>{module.moduleName}</CardTitle>
            {renderPriorityBadge(module.modulePriority)}
          </div>
          <CardDescription className="mt-1">
            {module.moduleDescription}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
          <Card className="bg-secondary/50 border-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/20">
              <CardTitle className="text-sm">Status</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <span className="text-sm font-medium">{module.moduleStatus}</span>
            </CardContent>
          </Card>
          <Card className="bg-secondary/50 border-muted/20">
            <CardHeader className="py-3 px-4 border-b border-border/20">
              <CardTitle className="text-sm">Test Cases</CardTitle>
            </CardHeader>
            <CardContent className="py-2 px-4">
              <Badge variant="outline" className="bg-primary/10 text-sm">
                {module.noOfTestCases}
              </Badge>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Test Cases</h3>
          <Dialog open={testCaseDialogOpen} onOpenChange={setTestCaseDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Test Case
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Create New Test Case</DialogTitle>
                <DialogDescription>
                  Fill in the test case details for module: {module.moduleName}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="testCaseName" className="text-sm font-medium">Test Case Name *</label>
                    <Input
                      id="testCaseName"
                      name="testCaseName"
                      value={newTestCase.testCaseName || ""}
                      onChange={handleInputChange}
                      placeholder="Enter test case name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                    <Select
                      value={newTestCase.status}
                      onValueChange={(value) => handleSelectChange(value, "status")}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="testCaseDescription" className="text-sm font-medium">Description</label>
                  <Textarea
                    id="testCaseDescription"
                    name="testCaseDescription"
                    value={newTestCase.testCaseDescription || ""}
                    onChange={handleInputChange}
                    placeholder="Enter test case description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="preconditions" className="text-sm font-medium">Preconditions</label>
                  <Textarea
                    id="preconditions"
                    name="preconditions"
                    value={newTestCase.preconditions || ""}
                    onChange={handleInputChange}
                    placeholder="Enter preconditions"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="expectedResult" className="text-sm font-medium">Expected Result *</label>
                  <Textarea
                    id="expectedResult"
                    name="expectedResult"
                    value={newTestCase.expectedResult || ""}
                    onChange={handleInputChange}
                    placeholder="Enter expected result"
                    rows={2}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTestCase.priority}
                    onValueChange={(value) => handleSelectChange(value, "priority")}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setTestCaseDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleCreateTestCase}>
                  Create Test Case
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      
      {testCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testCases.map((testCase) => (
            <Card 
              key={testCase.testCaseId} 
              className="cursor-pointer hover:scale-[1.02] transition-all duration-300 border-muted/40 relative flex flex-col"
              onClick={() => onSelectTestCase(testCase)}
            >
              <CardHeader className="pb-2 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-1">TC-{testCase.testCaseId}</Badge>
                    <CardTitle className="text-base">{testCase.testCaseName}</CardTitle>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderPriorityBadge(testCase.priority)}
                    {renderStatusBadge(testCase.status)}
                  </div>
                </div>
                <CardDescription className="mt-1 line-clamp-2">
                  {testCase.testCaseDescription}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="py-3 flex-grow">
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Expected Result</h4>
                    <p className="text-sm line-clamp-3">{testCase.expectedResult}</p>
                  </div>
                  
                  {testCase.preconditions && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Preconditions</h4>
                      <p className="text-sm line-clamp-2">{testCase.preconditions}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2 border-t border-border/30 justify-between mt-auto">
                <div className="flex items-center">
                  <span className="text-xs text-muted-foreground">
                    Created {new Date(testCase.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </CardFooter>
              
              <CardActions>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="cardAction" 
                        size="cardIcon" 
                        onClick={(e) => handleEditTestCase(e, testCase)}
                        aria-label="Edit test case"
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="cardAction" 
                        size="cardIcon" 
                        onClick={(e) => handleDeleteTestCase(e, testCase)}
                        aria-label="Delete test case"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="cardAction" 
                        size="cardIcon" 
                        onClick={(e) => handleViewAuditTrail(e, testCase)}
                        aria-label="View audit trail"
                      >
                        <History className="h-4 w-4 text-purple-600" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Audit Trail</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardActions>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 border border-dashed rounded-md bg-secondary/30">
          <ListChecks className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No test cases found</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => setTestCaseDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Test Case
          </Button>
        </div>
      )}
    </CardContent>

    {/* Delete Confirmation Dialog */}
    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the test case "{testCaseToDelete?.testCaseName}"? 
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTestCaseToDelete(null)}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmDeleteTestCase} className="bg-destructive text-destructive-foreground">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </Card>
  );
};

export default ModuleDetails;

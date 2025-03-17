
export interface TestStep {
  stepId: string;
  stepNumber: number;
  description: string;
  expectedResult: string;
  status: "Passed" | "Failed" | "Blocked" | "Not Run";
}

export interface TestCase {
  testCaseId: string;
  testCaseName: string;
  testCaseDescription: string;
  moduleId: string;
  priority: string;
  status: string;
  createdBy: string;
  createdDate: string;
  expectedResult: string;
  preconditions: string;
  testSteps: TestStep[];
}

export interface Module {
  moduleId: string;
  moduleName: string;
  moduleDescription: string;
  projectId: string;
  modulePriority: string;
  moduleStatus: string;
  moduleOwnerId: string;
  startDate: string;
  endDate: string;
  noOfTestCases: string;
}

export interface Project {
  projectId: string;
  projectName: string;
  projectDescription: string;
  startDate: string;
  endDate: string;
  projectStatus: string;
  projectOwnerId: string;
  noOfModules: string;
  type: string;
  platform: string;
  targetBrowser: string;
  url: string;
  priority: string;
}

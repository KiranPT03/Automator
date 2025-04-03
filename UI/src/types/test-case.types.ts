
// Test Case and Test Step type definitions
export interface TestStep {
  stepId?: string;
  testStepId?: string;
  stepNumber?: number;
  description: string;
  stepData?: string;
  stepStatus?: string;
  expectedResult?: string;
  testCaseId?: string;
  createdAt?: string;
  updatedAt?: string;
  order?: string;
}

export interface TestCase {
  testCaseId: string;
  testCaseName: string;
  testCaseStatus: string;
  description: string;
  precondition: string;
  expectedResult: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  noOfTestSteps: string;
  testSteps: TestStep[] | null;
  executionDateTime?: string;
}

export interface TestCasesState {
  testCases: TestCase[];
  currentTestCase: TestCase | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isExecuting: boolean;
  executionResults: Record<string, string>;
  testStepPollingIds: string[];
  currentExecutingStepIndex: number;
}

// Define the type for test case creation payload
export type CreateTestCasePayload = {
  testCaseName: string;
  testCaseStatus: string;
  description: string;
  precondition: string;
  expectedResult: string;
  priority: string;
};

// Define the type for test step creation payload (updated with order parameter as string)
export type CreateTestStepPayload = {
  description: string;
  stepData?: string;
  stepStatus?: string;
  order?: string;
};

// Define valid test step statuses
export const TestStepStatus = {
  NOT_RUN: "Not Run",
  EXECUTING: "Executing",
  PASSED: "Success",
  FAILED: "Failed",
  BLOCKED: "Blocked"
} as const;

export type TestStepStatusType = typeof TestStepStatus[keyof typeof TestStepStatus];

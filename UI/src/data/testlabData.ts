
import { Project, Module, TestCase } from "@/types/testlab";

// Sample project data
export const sampleProjects: Project[] = [
  {
    projectId: "1",
    projectName: "E-commerce Platform",
    projectDescription: "Development of a new online shopping platform.",
    startDate: "2023-10-26",
    endDate: "2024-06-30",
    projectStatus: "In Progress",
    projectOwnerId: "101",
    noOfModules: "5",
    type: "Functional",
    platform: "Desktop",
    targetBrowser: "Chrome",
    url: "https://www.example-ecommerce.com",
    priority: "High"
  },
  {
    projectId: "2",
    projectName: "Mobile Banking App",
    projectDescription: "Secure banking application for Android and iOS.",
    startDate: "2023-09-15",
    endDate: "2024-03-20",
    projectStatus: "In Progress",
    projectOwnerId: "102",
    noOfModules: "8",
    type: "Security",
    platform: "Mobile",
    targetBrowser: "N/A",
    url: "N/A",
    priority: "Critical"
  },
  {
    projectId: "3",
    projectName: "Healthcare Portal",
    projectDescription: "Patient management system for hospitals.",
    startDate: "2023-11-05",
    endDate: "2024-08-15",
    projectStatus: "Planning",
    projectOwnerId: "103",
    noOfModules: "6",
    type: "Functional",
    platform: "Web",
    targetBrowser: "All",
    url: "https://healthcare-portal-dev.example.com",
    priority: "Medium"
  }
];

// Sample modules data
export const sampleModules: Module[] = [
  {
    moduleId: "1",
    moduleName: "User Authentication",
    moduleDescription: "Handles user login, registration, and password management.",
    projectId: "1",
    modulePriority: "High",
    moduleStatus: "In Development",
    moduleOwnerId: "201",
    startDate: "2023-11-01",
    endDate: "2023-12-15",
    noOfTestCases: "25"
  },
  {
    moduleId: "2",
    moduleName: "Product Catalog",
    moduleDescription: "Browse and search products with filtering options.",
    projectId: "1",
    modulePriority: "Medium",
    moduleStatus: "In Testing",
    moduleOwnerId: "202",
    startDate: "2023-11-15",
    endDate: "2023-12-30",
    noOfTestCases: "18"
  },
  {
    moduleId: "3",
    moduleName: "Payment Processing",
    moduleDescription: "Credit card and alternative payment methods.",
    projectId: "1",
    modulePriority: "Critical",
    moduleStatus: "Planning",
    moduleOwnerId: "203",
    startDate: "2023-12-01",
    endDate: "2024-01-15",
    noOfTestCases: "12"
  },
  {
    moduleId: "4",
    moduleName: "Account Management",
    moduleDescription: "User profile and settings management.",
    projectId: "2",
    modulePriority: "High",
    moduleStatus: "In Development",
    moduleOwnerId: "204",
    startDate: "2023-10-01",
    endDate: "2023-11-15",
    noOfTestCases: "20"
  }
];

// Sample test cases data
export const sampleTestCases: TestCase[] = [
  {
    testCaseId: "1",
    testCaseName: "User Login Success",
    testCaseDescription: "Verify that a user can successfully login with valid credentials",
    moduleId: "1",
    priority: "High",
    status: "Ready",
    createdBy: "201",
    createdDate: "2023-11-05",
    expectedResult: "User should be logged in and redirected to dashboard",
    preconditions: "User is registered in the system",
    testSteps: [
      {
        stepId: "1-1",
        stepNumber: 1,
        description: "Navigate to login page",
        expectedResult: "Login form is displayed",
        status: "Passed"
      },
      {
        stepId: "1-2",
        stepNumber: 2,
        description: "Enter valid username and password",
        expectedResult: "Credentials are accepted",
        status: "Passed"
      },
      {
        stepId: "1-3",
        stepNumber: 3,
        description: "Click login button",
        expectedResult: "User is authenticated and redirected to dashboard",
        status: "Passed"
      }
    ]
  },
  {
    testCaseId: "2",
    testCaseName: "User Login Failure",
    testCaseDescription: "Verify that a user cannot login with invalid credentials",
    moduleId: "1",
    priority: "Medium",
    status: "Ready",
    createdBy: "201",
    createdDate: "2023-11-06",
    expectedResult: "User should see an error message",
    preconditions: "User is registered in the system",
    testSteps: [
      {
        stepId: "2-1",
        stepNumber: 1,
        description: "Navigate to login page",
        expectedResult: "Login form is displayed",
        status: "Passed"
      },
      {
        stepId: "2-2",
        stepNumber: 2,
        description: "Enter invalid username and password",
        expectedResult: "Credentials are rejected",
        status: "Passed"
      },
      {
        stepId: "2-3",
        stepNumber: 3,
        description: "Click login button",
        expectedResult: "Error message is displayed",
        status: "Failed"
      }
    ]
  },
  {
    testCaseId: "3",
    testCaseName: "Password Reset",
    testCaseDescription: "Verify that a user can reset their password",
    moduleId: "1",
    priority: "Medium",
    status: "Draft",
    createdBy: "202",
    createdDate: "2023-11-07",
    expectedResult: "User should receive password reset email",
    preconditions: "User is registered in the system",
    testSteps: [
      {
        stepId: "3-1",
        stepNumber: 1,
        description: "Navigate to login page",
        expectedResult: "Login form is displayed",
        status: "Not Run"
      },
      {
        stepId: "3-2",
        stepNumber: 2,
        description: "Click 'Forgot Password' link",
        expectedResult: "Password reset form is displayed",
        status: "Not Run"
      },
      {
        stepId: "3-3",
        stepNumber: 3,
        description: "Enter registered email address",
        expectedResult: "Email is accepted",
        status: "Not Run"
      },
      {
        stepId: "3-4",
        stepNumber: 4,
        description: "Click 'Reset Password' button",
        expectedResult: "Confirmation message is displayed",
        status: "Not Run"
      }
    ]
  }
];

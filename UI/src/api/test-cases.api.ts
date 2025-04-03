
import axios from 'axios';
import { BASE_URL, PROJECTS_ENDPOINT } from './constants';
import { TestCase, CreateTestCasePayload, TestStep, CreateTestStepPayload } from '@/types/test-case.types';

// Test Cases API methods
export const testCasesApi = {
  // Fetch module details with test cases
  async fetchModuleDetails(projectId: string, moduleId: string): Promise<any> {
    const response = await axios.get(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}`
    );
    return response.data;
  },
  
  // Create a new test case
  async createTestCase(
    projectId: string, 
    moduleId: string, 
    testCaseData: CreateTestCasePayload
  ): Promise<TestCase> {
    const response = await axios.post(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases`,
      testCaseData
    );
    return response.data;
  },

  // Get a single test case by ID
  async getTestCaseById(
    projectId: string,
    moduleId: string,
    testCaseId: string
  ): Promise<TestCase> {
    const response = await axios.get(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}`
    );
    return response.data;
  },

  // Delete a test case
  async deleteTestCase(
    projectId: string,
    moduleId: string,
    testCaseId: string
  ): Promise<void> {
    await axios.delete(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}`
    );
  },
  
  // Execute a test case
  async executeTestCase(
    projectId: string,
    moduleId: string,
    testCaseId: string
  ): Promise<TestCase> {
    const response = await axios.post(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/execute`
    );
    return response.data;
  },
  
  // Get a test step by ID
  async getTestStepById(
    projectId: string,
    moduleId: string,
    testCaseId: string,
    testStepId: string
  ): Promise<TestStep> {
    const response = await axios.get(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/teststeps/${testStepId}`
    );
    return response.data;
  },
  
  // Create a test step with order parameter as string
  async createTestStep(
    projectId: string,
    moduleId: string,
    testCaseId: string,
    testStepData: CreateTestStepPayload
  ): Promise<TestStep> {
    // Ensure order is a string if it exists
    const payload = {
      ...testStepData,
      order: testStepData.order !== undefined ? String(testStepData.order) : undefined
    };
    
    const response = await axios.post(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/teststeps`,
      payload
    );
    return response.data;
  },
  
  // Delete a test step
  async deleteTestStep(
    projectId: string,
    moduleId: string,
    testCaseId: string,
    testStepId: string
  ): Promise<void> {
    await axios.delete(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/teststeps/${testStepId}`
    );
  },
  
  // Update test step order
  async updateTestStepOrder(
    projectId: string,
    moduleId: string,
    testCaseId: string,
    testStepId: string,
    order: string
  ): Promise<TestStep> {
    const response = await axios.put(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/teststeps/${testStepId}`,
      { order }
    );
    return response.data;
  },
  
  // Download test results
  async downloadTestResults(
    projectId: string,
    moduleId: string,
    testCaseId: string
  ): Promise<{blob: Blob, filename: string}> {
    const response = await axios.get(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}/testcases/${testCaseId}/results?action=download`,
      {
        responseType: 'blob'
      }
    );
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers['content-disposition'];
    let filename = `test_results.pdf`; // Default filename
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename=(.+)/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }
    
    return {
      blob: response.data,
      filename: filename
    };
  }
};

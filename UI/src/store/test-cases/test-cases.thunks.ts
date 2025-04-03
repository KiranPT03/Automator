import { createAsyncThunk } from '@reduxjs/toolkit';
import { testCasesApi } from '@/api/test-cases.api';
import { TestCase, CreateTestCasePayload, TestStep, CreateTestStepPayload } from '@/types/test-case.types';

// Fetch module details with test cases
export const fetchModuleDetails = createAsyncThunk(
  'testCases/fetchModuleDetails',
  async ({ projectId, moduleId }: { projectId: string; moduleId: string }, { rejectWithValue }) => {
    try {
      return await testCasesApi.fetchModuleDetails(projectId, moduleId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to fetch module details: ${error.message}`
      );
    }
  }
);

// Create test case thunk
export const createTestCase = createAsyncThunk(
  'testCases/createTestCase',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseData 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseData: CreateTestCasePayload 
    }, 
    { rejectWithValue }
  ) => {
    try {
      return await testCasesApi.createTestCase(projectId, moduleId, testCaseData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to create test case: ${error.message}`
      );
    }
  }
);

// Get test case by ID thunk
export const getTestCaseById = createAsyncThunk(
  'testCases/getTestCaseById',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      return await testCasesApi.getTestCaseById(projectId, moduleId, testCaseId);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to fetch test case details: ${error.message}`
      );
    }
  }
);

// Delete test case thunk
export const deleteTestCase = createAsyncThunk(
  'testCases/deleteTestCase',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      await testCasesApi.deleteTestCase(projectId, moduleId, testCaseId);
      return testCaseId; // Return the ID so we can remove it from state
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to delete test case: ${error.message}`
      );
    }
  }
);

// Execute test case thunk
export const executeTestCase = createAsyncThunk(
  'testCases/executeTestCase',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const executedTestCase = await testCasesApi.executeTestCase(
        projectId, 
        moduleId, 
        testCaseId
      );
      
      return executedTestCase;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to execute test case: ${error.message}`
      );
    }
  }
);

// Get test step by ID thunk
export const getTestStepById = createAsyncThunk(
  'testCases/getTestStepById',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId,
      testStepId
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
      testStepId: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      const testStep = await testCasesApi.getTestStepById(
        projectId, 
        moduleId, 
        testCaseId,
        testStepId
      );
      
      return testStep;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to get test step details: ${error.message}`
      );
    }
  }
);

// Create test step thunk with order parameter
export const createTestStep = createAsyncThunk(
  'testCases/createTestStep',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId,
      testStepData 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
      testStepData: CreateTestStepPayload
    }, 
    { rejectWithValue }
  ) => {
    try {
      const newTestStep = await testCasesApi.createTestStep(
        projectId, 
        moduleId, 
        testCaseId, 
        testStepData
      );
      
      // After creating the test step, fetch the updated test case to get all steps
      const updatedTestCase = await testCasesApi.getTestCaseById(
        projectId,
        moduleId,
        testCaseId
      );
      
      return {
        testStep: newTestStep,
        testCase: updatedTestCase
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to create test step: ${error.message}`
      );
    }
  }
);

// Delete test step thunk
export const deleteTestStep = createAsyncThunk(
  'testCases/deleteTestStep',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId,
      testStepId 
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
      testStepId: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      await testCasesApi.deleteTestStep(
        projectId, 
        moduleId, 
        testCaseId, 
        testStepId
      );
      
      // After deleting the test step, fetch the updated test case
      const updatedTestCase = await testCasesApi.getTestCaseById(
        projectId,
        moduleId,
        testCaseId
      );
      
      return {
        deletedStepId: testStepId,
        updatedTestCase: updatedTestCase
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.status === 404 
          ? `Test step not found` 
          : error.response?.data?.message || 
            `Failed to delete test step: ${error.message}`
      );
    }
  }
);

// Update test step order thunk
export const updateTestStepOrder = createAsyncThunk(
  'testCases/updateTestStepOrder',
  async (
    { 
      projectId, 
      moduleId, 
      testCaseId,
      testStepId,
      order
    }: { 
      projectId: string; 
      moduleId: string; 
      testCaseId: string;
      testStepId: string;
      order: string;
    }, 
    { rejectWithValue }
  ) => {
    try {
      await testCasesApi.updateTestStepOrder(
        projectId, 
        moduleId, 
        testCaseId, 
        testStepId, 
        order
      );
      
      // After updating the test step order, fetch the updated test case
      const updatedTestCase = await testCasesApi.getTestCaseById(
        projectId,
        moduleId,
        testCaseId
      );
      
      return {
        updatedTestCase: updatedTestCase
      };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.status === 404 
          ? `Test step not found` 
          : `Failed to update test step order: ${error.message}`
      );
    }
  }
);

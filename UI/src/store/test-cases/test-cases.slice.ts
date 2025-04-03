import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestCasesState, TestCase, TestStep, TestStepStatus } from '@/types/test-case.types';
import { 
  fetchModuleDetails, 
  createTestCase, 
  getTestCaseById, 
  deleteTestCase, 
  createTestStep, 
  deleteTestStep,
  updateTestStepOrder,
  executeTestCase,
  getTestStepById
} from './test-cases.thunks';

const initialState: TestCasesState = {
  testCases: [],
  currentTestCase: null,
  status: 'idle',
  error: null,
  isExecuting: false,
  executionResults: {},
  testStepPollingIds: [],
  currentExecutingStepIndex: -1
};

const testCasesSlice = createSlice({
  name: 'testCases',
  initialState,
  reducers: {
    clearCurrentTestCase: (state) => {
      state.currentTestCase = null;
    },
    
    updateStepExecutionResult: (state, action: PayloadAction<{ stepId: string, status: string }>) => {
      state.executionResults[action.payload.stepId] = action.payload.status;
    },
    
    startPollingTestStep: (state, action: PayloadAction<string>) => {
      if (!state.testStepPollingIds.includes(action.payload)) {
        state.testStepPollingIds.push(action.payload);
      }
    },
    
    stopPollingTestStep: (state, action: PayloadAction<string>) => {
      state.testStepPollingIds = state.testStepPollingIds.filter(id => id !== action.payload);
    },
    
    resetExecutionState: (state) => {
      state.isExecuting = false;
      state.executionResults = {};
      state.testStepPollingIds = [];
      state.currentExecutingStepIndex = -1;
    },
    
    setCurrentExecutingStepIndex: (state, action: PayloadAction<number>) => {
      state.currentExecutingStepIndex = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleDetails.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchModuleDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.status = 'succeeded';
        if (action.payload && action.payload.testCases) {
          state.testCases = action.payload.testCases;
        } else {
          state.testCases = [];
        }
      })
      .addCase(fetchModuleDetails.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(createTestCase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTestCase.fulfilled, (state, action: PayloadAction<TestCase>) => {
        state.status = 'succeeded';
        state.testCases.push(action.payload);
        state.currentTestCase = action.payload;
      })
      .addCase(createTestCase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(getTestCaseById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getTestCaseById.fulfilled, (state, action: PayloadAction<TestCase>) => {
        state.status = 'succeeded';
        state.currentTestCase = action.payload;
        if (state.currentTestCase && !state.currentTestCase.testSteps) {
          state.currentTestCase.testSteps = [];
        }
      })
      .addCase(getTestCaseById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(deleteTestCase.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTestCase.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.testCases = state.testCases.filter(
          testCase => testCase.testCaseId !== action.payload
        );
        if (state.currentTestCase && state.currentTestCase.testCaseId === action.payload) {
          state.currentTestCase = null;
        }
      })
      .addCase(deleteTestCase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(createTestStep.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTestStep.fulfilled, (state, action: PayloadAction<{testStep: TestStep, testCase: TestCase}>) => {
        state.status = 'succeeded';
        state.currentTestCase = action.payload.testCase;
        const index = state.testCases.findIndex(tc => tc.testCaseId === action.payload.testCase.testCaseId);
        if (index !== -1) {
          state.testCases[index] = action.payload.testCase;
        }
      })
      .addCase(createTestStep.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(deleteTestStep.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteTestStep.fulfilled, (state, action: PayloadAction<{deletedStepId: string, updatedTestCase: TestCase}>) => {
        state.status = 'succeeded';
        state.currentTestCase = action.payload.updatedTestCase;
        const index = state.testCases.findIndex(tc => tc.testCaseId === action.payload.updatedTestCase.testCaseId);
        if (index !== -1) {
          state.testCases[index] = action.payload.updatedTestCase;
        }
      })
      .addCase(deleteTestStep.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(updateTestStepOrder.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateTestStepOrder.fulfilled, (state, action: PayloadAction<{updatedTestCase: TestCase}>) => {
        state.status = 'succeeded';
        state.currentTestCase = action.payload.updatedTestCase;
        const index = state.testCases.findIndex(tc => tc.testCaseId === action.payload.updatedTestCase.testCaseId);
        if (index !== -1) {
          state.testCases[index] = action.payload.updatedTestCase;
        }
      })
      .addCase(updateTestStepOrder.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      
      .addCase(executeTestCase.pending, (state) => {
        state.status = 'loading';
        state.isExecuting = true;
        state.executionResults = {};
        state.testStepPollingIds = [];
        state.currentExecutingStepIndex = 0;
      })
      .addCase(executeTestCase.fulfilled, (state, action: PayloadAction<TestCase>) => {
        state.status = 'succeeded';
        state.currentTestCase = action.payload;
        state.isExecuting = true;
        
        if (action.payload.testSteps && action.payload.testSteps.length > 0) {
          const firstStep = action.payload.testSteps[0];
          
          if (firstStep.stepId) {
            console.log(`Setting up initial polling for first step ${firstStep.stepId}`);
            
            state.executionResults[firstStep.stepId] = TestStepStatus.EXECUTING;
            if (!state.testStepPollingIds.includes(firstStep.stepId)) {
              state.testStepPollingIds.push(firstStep.stepId);
            }
          }
        }
      })
      .addCase(executeTestCase.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
        state.isExecuting = false;
        state.currentExecutingStepIndex = -1;
      })
      
      .addCase(getTestStepById.pending, (state) => {
        state.isExecuting = true;
      })
      .addCase(getTestStepById.fulfilled, (state, action: PayloadAction<TestStep>) => {
        state.isExecuting = true;
        
        if (action.payload.stepId && action.payload.stepStatus) {
          const stepId = action.payload.stepId;
          const currentStatus = state.executionResults[stepId];
          const newStatus = action.payload.stepStatus;
          
          console.log(`Step ${stepId} status: ${newStatus} (previous: ${currentStatus})`);
          
          // Only update the status if it's actually changed
          if (currentStatus !== newStatus) {
            state.executionResults[stepId] = newStatus;
            
            // Update the step status in the current test case
            if (state.currentTestCase?.testSteps) {
              const stepIndex = state.currentTestCase.testSteps.findIndex(
                step => step.stepId === stepId
              );
              if (stepIndex !== -1 && state.currentTestCase.testSteps) {
                state.currentTestCase.testSteps[stepIndex].stepStatus = newStatus;
              }
            }
          }
          
          // Only if step is complete (Success or Failed), stop polling it and move to next step
          if (newStatus === TestStepStatus.PASSED || newStatus === TestStepStatus.FAILED || 
              newStatus === "Success" || newStatus === "Failed") {
            
            console.log(`Step ${stepId} is complete with status ${newStatus}, preparing to move to next step`);
            
            // Remove this step from polling
            state.testStepPollingIds = state.testStepPollingIds.filter(
              id => id !== stepId
            );
            
            // Move to next step if available
            if (state.currentTestCase?.testSteps) {
              const nextStepIndex = state.currentExecutingStepIndex + 1;
              
              if (nextStepIndex < state.currentTestCase.testSteps.length) {
                const nextStep = state.currentTestCase.testSteps[nextStepIndex];
                if (nextStep.stepId) {
                  console.log(`Moving to next step: ${nextStep.stepId} (index: ${nextStepIndex})`);
                  state.testStepPollingIds.push(nextStep.stepId);
                  state.executionResults[nextStep.stepId] = TestStepStatus.EXECUTING;
                  state.currentExecutingStepIndex = nextStepIndex;
                  
                  if (state.currentTestCase.testSteps[nextStepIndex]) {
                    state.currentTestCase.testSteps[nextStepIndex].stepStatus = TestStepStatus.EXECUTING;
                  }
                }
              } else {
                console.log('All steps completed, stopping execution');
                state.isExecuting = false;
                state.currentExecutingStepIndex = -1;
              }
            }
            
            // Update execution datetime when step completes
            if (state.currentTestCase) {
              state.currentTestCase.executionDateTime = new Date().toISOString();
            }
          } else {
            console.log(`Step ${stepId} is still executing with status ${newStatus}, continuing to poll`);
          }
        }
      })
      .addCase(getTestStepById.rejected, (state, action) => {
        console.error("Error polling test step:", action.payload);
        // Keep executing flag true as long as there are any polling steps
        state.isExecuting = state.testStepPollingIds.length > 0;
      });
  },
});

export const { 
  clearCurrentTestCase, 
  updateStepExecutionResult, 
  startPollingTestStep, 
  stopPollingTestStep,
  resetExecutionState,
  setCurrentExecutingStepIndex
} = testCasesSlice.actions;
export default testCasesSlice.reducer;

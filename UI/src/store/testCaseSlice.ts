
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TestCase } from '@/types/testlab';

interface TestCaseState {
  testCases: TestCase[];
}

const initialState: TestCaseState = {
  testCases: [],
};

const testCaseSlice = createSlice({
  name: 'testCases',
  initialState,
  reducers: {
    setTestCases: (state, action: PayloadAction<TestCase[]>) => {
      state.testCases = action.payload;
    },
    addTestCase: (state, action: PayloadAction<TestCase>) => {
      state.testCases.push(action.payload);
    },
    updateTestCase: (state, action: PayloadAction<TestCase>) => {
      const index = state.testCases.findIndex(tc => tc.testCaseId === action.payload.testCaseId);
      if (index !== -1) {
        state.testCases[index] = action.payload;
      }
    },
    deleteTestCase: (state, action: PayloadAction<string>) => {
      state.testCases = state.testCases.filter(tc => tc.testCaseId !== action.payload);
    },
  },
});

export const { setTestCases, addTestCase, updateTestCase, deleteTestCase } = testCaseSlice.actions;
export default testCaseSlice.reducer;

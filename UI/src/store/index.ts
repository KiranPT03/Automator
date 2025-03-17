
import { configureStore } from '@reduxjs/toolkit';
import projectReducer from './projectSlice';
import moduleReducer from './moduleSlice';
import testCaseReducer from './testCaseSlice';

export const store = configureStore({
  reducer: {
    projects: projectReducer,
    modules: moduleReducer,
    testCases: testCaseReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

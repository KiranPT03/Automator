
import { configureStore } from '@reduxjs/toolkit';
import { projectsReducer } from './projects';
import { testCasesReducer } from './test-cases';

export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    testCases: testCasesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

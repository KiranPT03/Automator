
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Module } from '@/types/testlab';

interface ModuleState {
  modules: Module[];
}

const initialState: ModuleState = {
  modules: [],
};

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    setModules: (state, action: PayloadAction<Module[]>) => {
      state.modules = action.payload;
    },
    addModule: (state, action: PayloadAction<Module>) => {
      state.modules.push(action.payload);
    },
    updateModule: (state, action: PayloadAction<Module>) => {
      const index = state.modules.findIndex(m => m.moduleId === action.payload.moduleId);
      if (index !== -1) {
        state.modules[index] = action.payload;
      }
    },
    deleteModule: (state, action: PayloadAction<string>) => {
      state.modules = state.modules.filter(m => m.moduleId !== action.payload);
    },
  },
});

export const { setModules, addModule, updateModule, deleteModule } = moduleSlice.actions;
export default moduleSlice.reducer;

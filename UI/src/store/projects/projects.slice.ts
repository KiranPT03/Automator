
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProjectsState, Project, Module } from '@/types/project.types';
import { 
  fetchProjects, 
  fetchProjectById, 
  createProject, 
  deleteProject, 
  createModule, 
  deleteModule 
} from './projects.thunks';

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  status: 'idle',
  error: null,
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // Clear the current project when navigating away or as needed
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch projects cases
      .addCase(fetchProjects.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.status = 'succeeded';
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Fetch single project cases
      .addCase(fetchProjectById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProjectById.fulfilled, (state, action: PayloadAction<Project>) => {
        state.status = 'succeeded';
        // Ensure modules is an array
        const project = action.payload;
        if (!project.modules) {
          project.modules = [];
        }
        
        state.currentProject = project;
        
        // Update the project in the projects array if it exists
        const index = state.projects.findIndex(p => p.projectId === action.payload.projectId);
        if (index !== -1) {
          state.projects[index] = project;
        }
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create project cases
      .addCase(createProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.status = 'succeeded';
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete project cases
      .addCase(deleteProject.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
        state.status = 'succeeded';
        state.projects = state.projects.filter(
          project => project.projectId !== action.payload
        );
        // If the deleted project was the current project, clear it
        if (state.currentProject && state.currentProject.projectId === action.payload) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Create module cases - we'll now just add the module to state and let the project fetch handle updating everything
      .addCase(createModule.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createModule.fulfilled, (state, action: PayloadAction<{ projectId: string; module: Module }>) => {
        state.status = 'succeeded';
        // The full project update will happen when fetchProjectById completes
      })
      .addCase(createModule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      // Delete module cases - same approach as create
      .addCase(deleteModule.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteModule.fulfilled, (state, action: PayloadAction<{ projectId: string; moduleId: string }>) => {
        state.status = 'succeeded';
        // The full project update will happen when fetchProjectById completes
      })
      .addCase(deleteModule.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProject } = projectsSlice.actions;
export default projectsSlice.reducer;

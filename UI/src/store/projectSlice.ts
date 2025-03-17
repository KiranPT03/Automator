
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project } from '@/types/testlab';
import { fetchProjects, createProject, deleteProject } from '@/services/api';
import { toast } from 'sonner';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

const initialState: ProjectState = {
  projects: [],
  loading: false,
  error: null,
};

export const fetchProjectsAsync = createAsyncThunk(
  'projects/fetchProjects',
  async () => {
    const response = await fetchProjects();
    return response;
  }
);

export const createProjectAsync = createAsyncThunk(
  'projects/createProject',
  async (projectData: Partial<Project>) => {
    const response = await createProject(projectData);
    return response;
  }
);

export const deleteProjectAsync = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string) => {
    const response = await deleteProject(projectId);
    return { success: response.success, projectId };
  }
);

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    updateProjectModuleCount: (state, action: PayloadAction<{ projectId: string, count: number }>) => {
      const { projectId, count } = action.payload;
      const project = state.projects.find(p => p.projectId === projectId);
      if (project) {
        project.noOfModules = count.toString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects;
        state.error = action.payload.error;
      })
      .addCase(fetchProjectsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch projects';
      })
      .addCase(createProjectAsync.fulfilled, (state, action) => {
        if (action.payload.project) {
          state.projects.push(action.payload.project);
        }
      })
      .addCase(deleteProjectAsync.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.projects = state.projects.filter(p => p.projectId !== action.payload.projectId);
        }
      });
  },
});

export const { updateProjectModuleCount } = projectSlice.actions;
export default projectSlice.reducer;

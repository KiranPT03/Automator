
import { createAsyncThunk } from '@reduxjs/toolkit';
import { projectsApi } from '@/api/projects.api';
import { 
  Project, 
  CreateProjectPayload, 
  CreateModulePayload 
} from '@/types/project.types';

// Fetch all projects thunk
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (_, { rejectWithValue }) => {
    try {
      return await projectsApi.fetchProjects();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to fetch projects: ${error.message}`
      );
    }
  }
);

// Fetch single project thunk
export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (projectId: string, { rejectWithValue }) => {
    try {
      return await projectsApi.fetchProjectById(projectId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch project: ${error.message}`;
      return rejectWithValue(errorMessage);
    }
  }
);

// Create project thunk
export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await projectsApi.createProject(projectData);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to create project: ${error.message}`
      );
    }
  }
);

// Delete project thunk
export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (projectId: string, { rejectWithValue }) => {
    try {
      await projectsApi.deleteProject(projectId);
      // Return projectId to remove it from state
      return projectId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to delete project: ${error.message}`
      );
    }
  }
);

// Create module thunk
export const createModule = createAsyncThunk(
  'projects/createModule',
  async ({ projectId, moduleData }: { projectId: string; moduleData: CreateModulePayload }, { rejectWithValue, dispatch }) => {
    try {
      const response = await projectsApi.createModule(projectId, moduleData);
      
      // After successfully creating a module, fetch the project to get updated data
      dispatch(fetchProjectById(projectId));
      
      return { projectId, module: response };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to create module: ${error.message}`
      );
    }
  }
);

// Delete module thunk
export const deleteModule = createAsyncThunk(
  'projects/deleteModule',
  async ({ projectId, moduleId }: { projectId: string; moduleId: string }, { rejectWithValue, dispatch }) => {
    try {
      await projectsApi.deleteModule(projectId, moduleId);
      
      // After successfully deleting a module, fetch the project to get updated data
      dispatch(fetchProjectById(projectId));
      return { projectId, moduleId };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        `Failed to delete module: ${error.message}`
      );
    }
  }
);

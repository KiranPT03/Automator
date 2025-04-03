
import axios from 'axios';
import { BASE_URL, PROJECTS_ENDPOINT } from './constants';
import { Project, CreateProjectPayload, CreateModulePayload } from '@/types/project.types';

// Projects API methods
export const projectsApi = {
  // Fetch all projects
  async fetchProjects(): Promise<Project[]> {
    const response = await axios.get(`${BASE_URL}${PROJECTS_ENDPOINT}`);
    return response.data;
  },

  // Fetch a single project by ID
  async fetchProjectById(projectId: string): Promise<Project> {
    const response = await axios.get(`${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}`);
    
    // Ensure modules is an array, even if API returns null or undefined
    const project = response.data;
    if (!project.modules) {
      project.modules = [];
    }
    
    return project;
  },

  // Create a new project
  async createProject(projectData: CreateProjectPayload): Promise<Project> {
    const response = await axios.post(`${BASE_URL}${PROJECTS_ENDPOINT}`, projectData);
    return response.data;
  },

  // Delete a project
  async deleteProject(projectId: string): Promise<void> {
    const response = await axios.delete(`${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}`);
    if (response.status !== 204) {
      throw new Error(`Failed to delete project with status: ${response.status}`);
    }
  },

  // Create a module within a project
  async createModule(projectId: string, moduleData: CreateModulePayload): Promise<any> {
    const response = await axios.post(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/`, 
      moduleData
    );
    return response.data;
  },

  // Delete a module
  async deleteModule(projectId: string, moduleId: string): Promise<void> {
    const response = await axios.delete(
      `${BASE_URL}${PROJECTS_ENDPOINT}/${projectId}/modules/${moduleId}`
    );
    if (response.status !== 204) {
      throw new Error(`Failed to delete module with status: ${response.status}`);
    }
  }
};

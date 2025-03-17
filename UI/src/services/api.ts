
import axios from "axios";
import { Project } from "@/types/testlab";
import { toast } from "sonner";

// Get base URL from localStorage or use default
const getBaseUrl = () => {
  return localStorage.getItem("baseUrl") || "https://ce0e62e07320a0.lhr.life";
};

// API configuration
const getApiEndpoint = () => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}/api/v1/testlab-service/testcases/projects/`;
};

export const fetchProjects = async (): Promise<{ projects: Project[], error: string | null }> => {
  try {
    const API_PROJECTS_ENDPOINT = getApiEndpoint();
    console.log("Fetching projects from:", API_PROJECTS_ENDPOINT);
    const response = await axios.get(API_PROJECTS_ENDPOINT);
    console.log("API Response:", response.data);
    
    // Handle null or undefined response
    if (response.data === null || response.data === undefined) {
      console.log("No projects found (null/undefined response)");
      return { projects: [], error: null };
    }
    
    // Ensure projects is always an array
    if (Array.isArray(response.data)) {
      return { projects: response.data, error: null };
    } else {
      console.error("API response is not an array:", response.data);
      toast.error("Invalid data format received from the server.");
      return { projects: [], error: "Invalid data format received from the server." };
    }
  } catch (err) {
    console.error("Error fetching projects:", err);
    
    // Check if this is a 404 error (no projects found)
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      console.log("No projects found (404 response)");
      return { projects: [], error: null };
    }
    
    toast.error("Failed to fetch projects. Please try again later.");
    return { projects: [], error: "Failed to fetch projects. Please try again later." };
  }
};

export const deleteProject = async (projectId: string): Promise<{ success: boolean, error: string | null }> => {
  try {
    console.log(`Deleting project with ID: ${projectId}`);
    const deleteUrl = `${getApiEndpoint()}${projectId}`;
    console.log("Delete URL:", deleteUrl);
    
    const response = await axios.delete(deleteUrl);
    console.log("Delete Response:", response);
    
    if (response.status === 200 || response.status === 204) {
      toast.success("Project deleted successfully");
      return { success: true, error: null };
    } else {
      console.error("Unexpected response status:", response.status);
      toast.error("Failed to delete project. Unexpected response from server.");
      return { success: false, error: "Failed to delete project. Unexpected response from server." };
    }
  } catch (err) {
    console.error("Error deleting project:", err);
    toast.error("Failed to delete project. Please try again later.");
    return { success: false, error: "Failed to delete project. Please try again later." };
  }
};

export const createProject = async (projectData: Partial<Project>): Promise<{ project: Project | null, error: string | null }> => {
  try {
    console.log("Creating new project with data:", projectData);
    
    const response = await axios.post(getApiEndpoint(), projectData);
    console.log("Create Project Response:", response.data);
    
    if (response.status === 200 || response.status === 201) {
      toast.success("Project created successfully");
      return { project: response.data, error: null };
    } else {
      console.error("Unexpected response status:", response.status);
      toast.error("Failed to create project. Unexpected response from server.");
      return { project: null, error: "Failed to create project. Unexpected response from server." };
    }
  } catch (err) {
    console.error("Error creating project:", err);
    toast.error("Failed to create project. Please try again later.");
    return { project: null, error: "Failed to create project. Please try again later." };
  }
};

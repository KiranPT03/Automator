
// Project and Module type definitions
export interface Module {
  moduleId: string;
  moduleName: string;
  description: string;
  moduleStatus: string;
  modulePriority: string;
  noOfTestCases: string;
  createdAt: string;
  updatedAt: string;
  testCases?: any[] | null;
}

export interface Project {
  projectId: string;
  projectName: string;
  projectDescription: string;
  projectStatus: string;
  projectOwnerId?: string;
  noOfModules?: string | number;
  type: string;
  platform: string;
  targetBrowser?: string;
  url?: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  modules?: Module[] | null;
}

export interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the type for the project creation data
export type CreateProjectPayload = {
  projectName: string;
  projectDescription: string;
  projectStatus: string;
  projectOwnerId?: string;
  type: string;
  platform: string;
  targetBrowser?: string;
  url?: string;
  priority: string;
};

// Define the type for module creation data
export type CreateModulePayload = {
  moduleName: string;
  description: string;
  moduleStatus: string;
  modulePriority: string;
};

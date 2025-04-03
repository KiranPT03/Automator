
import { useState, useEffect } from "react";
import { Project, Module, fetchProjectById } from "@/store/projects";
import { useAppDispatch } from "@/hooks/redux-hooks";
import { ProjectList } from "./projects/ProjectList";
import { ModuleList } from "./modules/ModuleList";
import { TestCaseList } from "./TestCaseList";
import { TestStepList } from "./TestStepList";
import { TestCase } from "@/types/test-case.types";

export enum TestCaseHierarchyLevel {
  PROJECT_LIST,
  MODULE_LIST,
  TEST_CASE_LIST,
  TEST_STEP_LIST,
}

export function TestCaseManager() {
  const dispatch = useAppDispatch();
  const [level, setLevel] = useState<TestCaseHierarchyLevel>(TestCaseHierarchyLevel.PROJECT_LIST);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);
  
  // Refresh project data when moving back to module list
  useEffect(() => {
    if (level === TestCaseHierarchyLevel.MODULE_LIST && selectedProject) {
      dispatch(fetchProjectById(selectedProject.projectId));
    }
  }, [level, selectedProject, dispatch]);
  
  const handleSelectProject = async (project: Project) => {
    setSelectedProject(project);
    setLevel(TestCaseHierarchyLevel.MODULE_LIST);
  };
  
  const handleSelectModule = (module: Module) => {
    setSelectedModule(module);
    setLevel(TestCaseHierarchyLevel.TEST_CASE_LIST);
  };
  
  const handleSelectTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setLevel(TestCaseHierarchyLevel.TEST_STEP_LIST);
  };
  
  const handleBackToProjects = () => {
    setLevel(TestCaseHierarchyLevel.PROJECT_LIST);
    setSelectedProject(null);
    setSelectedModule(null);
    setSelectedTestCase(null);
  };
  
  const handleBackToModules = () => {
    // Refresh project data when going back to modules list
    if (selectedProject) {
      dispatch(fetchProjectById(selectedProject.projectId));
    }
    
    setLevel(TestCaseHierarchyLevel.MODULE_LIST);
    setSelectedModule(null);
    setSelectedTestCase(null);
  };
  
  const handleBackToTestCases = () => {
    setLevel(TestCaseHierarchyLevel.TEST_CASE_LIST);
    setSelectedTestCase(null);
  };
  
  return (
    <div>
      {level === TestCaseHierarchyLevel.PROJECT_LIST && (
        <ProjectList onSelectProject={handleSelectProject} />
      )}
      
      {level === TestCaseHierarchyLevel.MODULE_LIST && selectedProject && (
        <ModuleList 
          project={selectedProject} 
          onBack={handleBackToProjects}
          onSelectModule={handleSelectModule}
        />
      )}
      
      {level === TestCaseHierarchyLevel.TEST_CASE_LIST && selectedProject && selectedModule && (
        <TestCaseList 
          project={selectedProject} 
          module={selectedModule} 
          onBack={handleBackToModules}
          onSelectTestCase={handleSelectTestCase}
        />
      )}
      
      {level === TestCaseHierarchyLevel.TEST_STEP_LIST && selectedProject && selectedModule && selectedTestCase && (
        <TestStepList 
          project={selectedProject} 
          module={selectedModule} 
          testCase={selectedTestCase} 
          onBack={handleBackToTestCases}
        />
      )}
    </div>
  );
}

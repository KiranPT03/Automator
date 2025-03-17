import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileCheck, 
  Package, 
  Calendar, 
  ClipboardList
} from "lucide-react";

import ProjectList from "@/components/TestLab/ProjectList";
import ProjectDetails from "@/components/TestLab/ProjectDetails";
import ModuleDetails from "@/components/TestLab/ModuleDetails";
import TestCaseDetails from "@/components/TestLab/TestCaseDetails";

import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchProjectsAsync } from "@/store/projectSlice";
import { setModules } from "@/store/moduleSlice";
import { setTestCases } from "@/store/testCaseSlice";

import { 
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";

import { Project, Module, TestCase } from "@/types/testlab";

import { sampleModules, sampleTestCases } from "@/data/testlabData";

const TestLab: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const { projects } = useAppSelector(state => state.projects);
  const { modules } = useAppSelector(state => state.modules);
  const { testCases } = useAppSelector(state => state.testCases);
  
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  useEffect(() => {
    dispatch(setModules(sampleModules));
    dispatch(setTestCases(sampleTestCases));
  }, [dispatch]);

  const handleSelectProjectCard = (project: Project) => {
    setSelectedProject(project);
    setSelectedModule(null);
    setSelectedTestCase(null);
  };

  const handleSelectModuleCard = (module: Module) => {
    setSelectedModule(module);
    setSelectedTestCase(null);
  };

  const handleSelectTestCase = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setSelectedModule(null);
    setSelectedTestCase(null);
  };

  const handleBackToModules = () => {
    setSelectedModule(null);
    setSelectedTestCase(null);
  };

  const handleBackToTestCases = () => {
    setSelectedTestCase(null);
  };

  const filteredModules = modules.filter(
    module => module.projectId === selectedProject?.projectId
  );

  const filteredTestCases = testCases.filter(
    testCase => testCase.moduleId === selectedModule?.moduleId
  );

  const renderBreadcrumbs = () => {
    return (
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            {!selectedProject ? (
              <BreadcrumbPage>Test Lab</BreadcrumbPage>
            ) : (
              <BreadcrumbLink onClick={handleBackToProjects}>Test Lab</BreadcrumbLink>
            )}
          </BreadcrumbItem>
          
          {selectedProject && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {!selectedModule ? (
                  <BreadcrumbPage>{selectedProject.projectName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => {
                    setSelectedModule(null);
                    setSelectedTestCase(null);
                  }}>
                    {selectedProject.projectName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}
          
          {selectedModule && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {!selectedTestCase ? (
                  <BreadcrumbPage>{selectedModule.moduleName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink onClick={() => {
                    setSelectedTestCase(null);
                  }}>
                    {selectedModule.moduleName}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </>
          )}
          
          {selectedTestCase && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedTestCase.testCaseName}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Test Lab</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage test cases, suites, plans, and requirements.
          </p>
        </div>

        <Tabs defaultValue="test-cases" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-4xl">
            <TabsTrigger value="test-cases" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Test Cases</span>
            </TabsTrigger>
            <TabsTrigger value="test-suite" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Test Suite</span>
            </TabsTrigger>
            <TabsTrigger value="test-plans" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Test Plans</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Requirements Management</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="test-cases">
            {renderBreadcrumbs()}
            
            {selectedTestCase ? (
              <TestCaseDetails 
                testCase={selectedTestCase}
                testCases={testCases}
                setTestCases={setTestCases}
                onBackClick={handleBackToTestCases}
              />
            ) : selectedModule ? (
              <ModuleDetails 
                module={selectedModule}
                testCases={filteredTestCases}
                setTestCases={setTestCases}
                modules={modules}
                setModules={setModules}
                onBackClick={handleBackToModules}
                onSelectTestCase={handleSelectTestCase}
              />
            ) : selectedProject ? (
              <ProjectDetails 
                project={selectedProject}
                modules={filteredModules}
                setModules={setModules}
                projects={projects}
                onBackClick={handleBackToProjects}
                onSelectModule={handleSelectModuleCard}
              />
            ) : (
              <ProjectList 
                onSelectProject={handleSelectProjectCard}
              />
            )}
          </TabsContent>
          
          <TabsContent value="test-suite">
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-muted-foreground">Test Suite management will be added soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="test-plans">
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-muted-foreground">Test Plan management will be added soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="requirements">
            <div className="flex items-center justify-center h-64 border rounded-md">
              <p className="text-muted-foreground">Requirements management will be added soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default TestLab;

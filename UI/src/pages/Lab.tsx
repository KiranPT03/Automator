
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TestCaseManager } from "@/components/test-management/TestCaseManager";
import { TestSuitesTab } from "@/components/test-management/TestSuitesTab";

const Lab = () => {
  return (
    <div className="space-y-4 font-['Open_Sans']">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lab</h1>
        <p className="text-sm text-muted-foreground">
          Create and manage test cases in your test lab.
        </p>
      </div>
      
      <style>
        {`
          .table-container {
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          
          .table-header {
            background-color: rgba(243, 244, 246, 0.8);
            position: sticky;
            top: 0;
            z-index: 10;
          }
          
          @media (prefers-color-scheme: dark) {
            .table-header {
              background-color: rgba(31, 41, 55, 0.8);
            }
            
            /* Ensure consistent header styling in dark mode */
            thead {
              background-color: hsl(var(--muted));
            }
            
            /* Fix for different header colors in dark mode */
            th {
              background-color: hsl(var(--muted));
            }
          }
          
          .action-button-edit,
          .action-button-delete,
          .action-button-audit {
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 9999px;
            padding: 0.375rem;
            transition-property: color, background-color, border-color;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
          }
          
          .action-button-edit {
            background-color: rgba(59, 130, 246, 0.1);
            color: rgb(37, 99, 235);
          }
          
          .action-button-edit:hover {
            background-color: rgba(59, 130, 246, 0.2);
          }
          
          .action-button-delete {
            background-color: rgba(239, 68, 68, 0.1);
            color: rgb(220, 38, 38);
          }
          
          .action-button-delete:hover {
            background-color: rgba(239, 68, 68, 0.2);
          }
          
          .action-button-audit {
            background-color: rgba(139, 92, 246, 0.1);
            color: rgb(124, 58, 237);
          }
          
          .action-button-audit:hover {
            background-color: rgba(139, 92, 246, 0.2);
          }
          
          @media (prefers-color-scheme: dark) {
            .action-button-edit {
              background-color: rgba(59, 130, 246, 0.2);
              color: rgb(96, 165, 250);
            }
            
            .action-button-edit:hover {
              background-color: rgba(59, 130, 246, 0.3);
            }
            
            .action-button-delete {
              background-color: rgba(239, 68, 68, 0.2);
              color: rgb(248, 113, 113);
            }
            
            .action-button-delete:hover {
              background-color: rgba(239, 68, 68, 0.3);
            }
            
            .action-button-audit {
              background-color: rgba(139, 92, 246, 0.2);
              color: rgb(167, 139, 250);
            }
            
            .action-button-audit:hover {
              background-color: rgba(139, 92, 246, 0.3);
            }
          }
        `}
      </style>
      
      <Tabs defaultValue="test-cases" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="test-cases">Test Cases</TabsTrigger>
          <TabsTrigger value="test-suites">Test Suites</TabsTrigger>
        </TabsList>
        
        <TabsContent value="test-cases" className="border rounded-lg p-6 bg-card text-card-foreground min-h-[300px]">
          <TestCaseManager />
        </TabsContent>
        
        <TabsContent value="test-suites" className="border rounded-lg p-6 bg-card text-card-foreground min-h-[300px]">
          <TestSuitesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Lab;

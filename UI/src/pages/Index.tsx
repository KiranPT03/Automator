
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout/Layout";

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome to Automator Test Management portal.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            title="Test Cases"
            description="Total test cases in the system"
            value="1,248"
          />
          <DashboardCard
            title="Test Runs"
            description="Test executions this month"
            value="156"
          />
          <DashboardCard
            title="Defects"
            description="Open issues requiring attention"
            value="24"
          />
          <DashboardCard
            title="Automation Rate"
            description="Tests with automation coverage"
            value="68%"
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Executions</CardTitle>
              <CardDescription>
                Latest test runs across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Visualization of recent test executions would appear here.
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Defect Trends</CardTitle>
              <CardDescription>
                Weekly defect creation vs resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Chart showing defect trend analysis would appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  value: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, 
  description, 
  value 
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default Dashboard;

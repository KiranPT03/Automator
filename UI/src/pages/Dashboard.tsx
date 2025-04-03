
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4Icon, BugIcon, FlaskConicalIcon, PlaySquareIcon } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to QaGenie, your QA automation portal.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <FlaskConicalIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">568</div>
            <p className="text-xs text-muted-foreground">
              +12 from last week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Executions</CardTitle>
            <PlaySquareIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Open Defects</CardTitle>
            <BugIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              -4 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <BarChart4Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92.6%</div>
            <p className="text-xs text-muted-foreground">
              +2.3% from last week
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Executions</CardTitle>
            <CardDescription>
              Showing the last 5 test executions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">Regression Test #{987 - i}</p>
                    <p className="text-xs text-muted-foreground">
                      Executed {i === 0 ? 'today' : `${i} day${i > 1 ? 's' : ''} ago`}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${i % 2 === 0 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {i % 2 === 0 ? 'Passed' : 'Failed'}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Latest Defects</CardTitle>
            <CardDescription>
              Recently reported defects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b pb-2">
                  <p className="font-medium">QA-{1203 - i}: {['UI Alignment Issue', 'API Response Error', 'Performance Degradation', 'Login Failure'][i]}</p>
                  <p className="text-xs text-muted-foreground">
                    Priority: {['Low', 'Medium', 'High', 'Critical'][i]}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

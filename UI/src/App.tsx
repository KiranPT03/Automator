
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from "@/components/theme-provider";
import { Layout } from "@/components/layout";
import Dashboard from "@/pages/Dashboard";
import Lab from "@/pages/Lab";
import Executor from "@/pages/Executor";
import Defects from "@/pages/Defects";
import Reporting from "@/pages/Reporting";
import Admin from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <ThemeProvider defaultTheme="system">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/lab" element={<Lab />} />
                  <Route path="/executor" element={<Executor />} />
                  <Route path="/defects" element={<Defects />} />
                  <Route path="/reporting" element={<Reporting />} />
                  <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </Provider>
    </QueryClientProvider>
  );
};

export default App;

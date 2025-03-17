
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import { store } from './store';
import Index from "./pages/Index";
import TestLab from "./pages/TestLab";
import Administration from "./pages/Administration";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Sonner position="top-right" closeButton richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/test-lab" element={<TestLab />} />
            <Route path="/test-execution" element={<Index />} />
            <Route path="/defect-management" element={<Index />} />
            <Route path="/reporting" element={<Index />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;

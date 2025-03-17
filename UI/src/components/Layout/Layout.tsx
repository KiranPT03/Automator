
import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header toggleSidebar={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <main 
        className={cn(
          "main-content pt-16 min-h-screen",
          sidebarOpen ? "lg:pl-[240px]" : "lg:pl-[64px]"
        )}
      >
        <div className="container mx-auto p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

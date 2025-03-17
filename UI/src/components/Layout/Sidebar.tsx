
import React from "react";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  TestTube, 
  ListChecks, 
  Bug, 
  BarChart3, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Test Lab", path: "/test-lab", icon: TestTube },
  { name: "Test Execution", path: "/test-execution", icon: ListChecks },
  { name: "Defect Management", path: "/defect-management", icon: Bug },
  { name: "Reporting & Analytics", path: "/reporting", icon: BarChart3 },
  { name: "Administration", path: "/administration", icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen pt-16 z-40 transition-all duration-300 ease-in-out border-r border-border bg-sidebar shadow-sm",
        isOpen ? "sidebar-width" : "sidebar-width-collapsed -translate-x-0",
        "lg:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 py-6 px-2 overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "sidebar-item group",
                  isActive ? "sidebar-item-active" : "hover:bg-secondary dark:hover:bg-sidebar-accent"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all",
                  isOpen ? "mr-2" : "mx-auto"
                )} />
                {isOpen && (
                  <span className="animate-fade-in whitespace-nowrap overflow-hidden text-ellipsis">{item.name}</span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </aside>
  );
};

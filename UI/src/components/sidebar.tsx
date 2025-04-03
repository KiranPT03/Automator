
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { QaGenieLogo } from "./qa-genie-logo";
import {
  LayoutDashboardIcon,
  FlaskConicalIcon,
  PlaySquareIcon,
  BugIcon,
  BarChart4Icon,
  SettingsIcon,
  User2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboardIcon,
    href: "/",
  },
  {
    title: "Lab",
    icon: FlaskConicalIcon,
    href: "/lab",
    subMenu: ["Test Cases", "Test Suites"],
  },
  {
    title: "Executor",
    icon: PlaySquareIcon,
    href: "/executor",
    subMenu: ["Test Executor", "Test Scheduler"],
  },
  {
    title: "Defect Management",
    icon: BugIcon,
    href: "/defects",
  },
  {
    title: "Reporting & Analysis",
    icon: BarChart4Icon,
    href: "/reporting",
  },
  {
    title: "Administration",
    icon: SettingsIcon,
    href: "/admin",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex h-screen flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-3">
          <div className="flex items-center gap-2">
            <QaGenieLogo className="h-8 w-8 flex-shrink-0" />
            {!collapsed && (
              <span className="text-lg font-semibold text-sidebar-foreground">
                RapidQA
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto py-6">
          <nav className={cn("grid items-start px-2 gap-3", collapsed && "justify-items-center")}>
            {sidebarItems.map((item, index) => (
              <Tooltip key={index} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.href}
                    className={cn(
                      "sidebar-item",
                      collapsed ? "justify-center px-2 w-10 h-10" : "h-10",
                      location.pathname === item.href && "active"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.title}
                  </TooltipContent>
                )}
              </Tooltip>
            ))}
          </nav>
        </div>
        
        <div className="flex justify-center py-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 rounded-full transition-transform duration-300 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
            ) : (
              <ChevronLeftIcon className="h-4 w-4 flex-shrink-0" />
            )}
          </Button>
        </div>
        
        <div className="border-t border-sidebar-border p-3 flex flex-col gap-3 items-center">
          <ThemeToggle />
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
            <User2Icon className="h-4 w-4 flex-shrink-0" />
            <span className="sr-only">User settings</span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}


import React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import CompanyIcon from "@/components/CompanyIcon";

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="header-height fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full lg:hidden"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <CompanyIcon size={28} className="text-primary" />
          <span className="text-lg md:text-xl font-semibold tracking-tight">Automator</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
};

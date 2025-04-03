
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ModuleSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function ModuleSearch({ searchQuery, setSearchQuery }: ModuleSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search modules..."
        className="pl-9"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

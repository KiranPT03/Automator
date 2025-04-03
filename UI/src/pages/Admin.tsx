
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const Admin = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
        <p className="text-sm text-muted-foreground">
          Manage users, settings, and system configuration.
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search settings and users..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Card className="card-content p-6 bg-card text-card-foreground flex items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Administration content will be displayed here.</p>
      </Card>
    </div>
  );
};

export default Admin;

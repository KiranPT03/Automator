
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Edit, Trash2, History } from "lucide-react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Defect {
  id: string;
  title: string;
  status: string;
  severity: string;
  assignedTo: string;
  createdAt: Date;
}

const Defects = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [defects, setDefects] = useState<Defect[]>([
    {
      id: "DEF-001",
      title: "Login button unresponsive on Safari",
      status: "Open",
      severity: "High",
      assignedTo: "John Doe",
      createdAt: new Date(2023, 5, 15)
    },
    {
      id: "DEF-002",
      title: "Data not saving in profile page",
      status: "In Progress",
      severity: "Critical",
      assignedTo: "Jane Smith",
      createdAt: new Date(2023, 6, 10)
    },
    {
      id: "DEF-003",
      title: "Incorrect calculation in reports",
      status: "Open",
      severity: "Medium",
      assignedTo: "Mike Johnson",
      createdAt: new Date(2023, 6, 20)
    }
  ]);
  
  const filteredDefects = defects.filter(defect =>
    defect.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defect.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defect.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defect.severity.toLowerCase().includes(searchQuery.toLowerCase()) ||
    defect.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleEdit = (id: string) => {
    toast.info(`Editing defect ${id}`);
  };
  
  const handleDelete = (id: string) => {
    toast.success(`Defect ${id} deleted`);
    setDefects(defects.filter(defect => defect.id !== id));
  };
  
  const handleAudit = (id: string) => {
    toast.info(`Viewing audit trail for defect ${id}`);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Defect Management</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage defects and issues.
        </p>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search defects..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Card className="card-content p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDefects.length > 0 ? (
              filteredDefects.map((defect) => (
                <TableRow key={defect.id}>
                  <TableCell className="font-medium">{defect.id}</TableCell>
                  <TableCell>{defect.title}</TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        defect.status === "Open" 
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" 
                          : defect.status === "In Progress" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      }`}
                    >
                      {defect.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        defect.severity === "Critical" 
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" 
                          : defect.severity === "High" 
                          ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" 
                          : defect.severity === "Medium" 
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" 
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {defect.severity}
                    </span>
                  </TableCell>
                  <TableCell>{defect.assignedTo}</TableCell>
                  <TableCell>{defect.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="action-button-edit"
                        onClick={() => handleEdit(defect.id)}
                        title="Edit"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="action-button-delete"
                        onClick={() => handleDelete(defect.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        className="action-button-audit"
                        onClick={() => handleAudit(defect.id)}
                        title="Audit Trail"
                      >
                        <History className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No defects found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default Defects;

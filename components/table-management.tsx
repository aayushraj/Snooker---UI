"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Edit, PlusCircle } from 'lucide-react'
import { formatCurrency } from "@/lib/utils"

interface TableConfig {
  id: string;
  name: string;
  hourlyRate: number;
  location: string;
}

export function TableManagement() {
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<TableConfig | null>(null);
  const [tableName, setTableName] = useState("");
  const [hourlyRate, setHourlyRate] = useState(0);
  const [location, setLocation] = useState("");
  const { toast } = useToast();

  const fetchTables = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/tables');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: TableConfig[] = await response.json();
      setTables(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleOpenDialog = (table?: TableConfig) => {
    setCurrentTable(table || null);
    setTableName(table?.name || "");
    setHourlyRate(table?.hourlyRate || 0);
    setLocation(table?.location || "");
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentTable(null);
    setTableName("");
    setHourlyRate(0);
    setLocation("");
  };

  const handleSubmit = async () => {
    if (!tableName.trim() || hourlyRate <= 0 || !location.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const tableData = { name: tableName, hourlyRate, location };
    let response;
    let method;
    let url;

    if (currentTable) {
      // Update existing table
      method = 'PUT';
      url = `https://localhost:5001/api/tables/${currentTable.id}`;
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentTable.id, ...tableData }),
      });
    } else {
      // Create new table
      method = 'POST';
      url = 'https://localhost:5001/api/tables';
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tableData),
      });
    }

    if (response.ok) {
      toast({
        title: "Success",
        description: `Table ${currentTable ? "updated" : "created"} successfully.`,
      });
      fetchTables();
      handleCloseDialog();
    } else {
      const errorData = await response.json();
      toast({
        title: "Error",
        description: `Failed to ${currentTable ? "update" : "create"} table: ${errorData.message || response.statusText}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this table?")) {
      return;
    }
    try {
      const response = await fetch(`https://localhost:5001/api/tables/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Table deleted successfully.",
        });
        fetchTables();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to delete table: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="text-center py-12">Loading table configurations...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Table Configurations</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
        </Button>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No tables configured yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>{formatCurrency(table.hourlyRate)}</TableCell>
                  <TableCell>{table.location}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(table)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(table.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTable ? "Edit Table" : "Add New Table"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableName" className="text-right">
                Table Name
              </Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {currentTable ? "Save Changes" : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

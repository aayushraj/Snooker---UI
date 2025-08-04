"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

interface Table {
  id: string
  name: string
  hourlyRate: number
  location: string
}

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [name, setName] = useState("")
  const [hourlyRate, setHourlyRate] = useState<number>(0)
  const [location, setLocation] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:5001/api/tables")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Table[] = await response.json()
      setTables(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Failed to fetch tables:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTable = () => {
    setCurrentTable(null)
    setName("")
    setHourlyRate(0)
    setLocation("")
    setIsDialogOpen(true)
  }

  const handleEditTable = (table: Table) => {
    setCurrentTable(table)
    setName(table.name)
    setHourlyRate(table.hourlyRate)
    setLocation(table.location)
    setIsDialogOpen(true)
  }

  const handleDeleteTable = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this table? This action cannot be undone.")) return

    try {
      const response = await fetch(`https://localhost:5001/api/tables/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Table Deleted!",
        description: "The table has been successfully removed.",
        variant: "default",
      })
      fetchTables()
    } catch (error: any) {
      toast({
        title: "Error deleting table",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error deleting table:", error)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const tableData = { name, hourlyRate, location }
    const method = currentTable ? "PUT" : "POST"
    const url = currentTable
      ? `https://localhost:5001/api/tables/${currentTable.id}`
      : "https://localhost:5001/api/tables"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tableData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: currentTable ? "Table Updated!" : "Table Added!",
        description: `Table "${name}" has been ${currentTable ? "updated" : "added"} successfully.`,
        variant: "default",
      })
      setIsDialogOpen(false)
      fetchTables()
    } catch (error: any) {
      toast({
        title: `Error ${currentTable ? "updating" : "adding"} table`,
        description: error.message,
        variant: "destructive",
      })
      console.error(`Error ${currentTable ? "updating" : "adding"} table:`, error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading tables...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Table Configuration</h1>
        <Button onClick={handleAddTable}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
        </Button>
      </div>

      {tables.length === 0 ? (
        <div className="text-center text-gray-500">No tables configured yet. Add some to get started!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((table) => (
            <Card key={table.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{table.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditTable(table)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTable(table.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Location: {table.location}</p>
                <p className="text-lg font-bold">Hourly Rate: ${table.hourlyRate.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTable ? "Edit Table" : "Add New Table"}</DialogTitle>
            <DialogDescription>
              {currentTable ? "Modify the details of the table." : "Enter details for a new snooker table."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number.parseFloat(e.target.value))}
                className="col-span-3"
                required
                step="0.01"
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !name || hourlyRate <= 0}>
              {loading ? "Saving..." : currentTable ? "Save Changes" : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

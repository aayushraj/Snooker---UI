"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { toast } from "sonner"
import { PlusCircle, Edit, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TableData {
  id: string
  name: string
  hourlyRate: number
  location: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function TableManagement() {
  const [tables, setTables] = useState<TableData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentTable, setCurrentTable] = useState<TableData | null>(null)
  const [tableName, setTableName] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTables = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/tables`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setTables(data)
    } catch (err) {
      console.error("Failed to fetch tables:", err)
      setError("Failed to load table data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const resetForm = () => {
    setCurrentTable(null)
    setTableName("")
    setHourlyRate("")
    setLocation("")
    setIsSubmitting(false)
  }

  const handleOpenDialog = (table?: TableData) => {
    if (table) {
      setCurrentTable(table)
      setTableName(table.name)
      setHourlyRate(table.hourlyRate.toString())
      setLocation(table.location)
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!tableName.trim() || !hourlyRate.trim() || !location.trim()) {
      toast.error("All fields are required.")
      return
    }
    const rate = Number.parseFloat(hourlyRate)
    if (isNaN(rate) || rate <= 0) {
      toast.error("Hourly rate must be a positive number.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      name: tableName,
      hourlyRate: rate,
      location: location,
    }

    try {
      let response
      if (currentTable) {
        response = await fetch(`${API_BASE_URL}/api/tables/${currentTable.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error("Failed to update table.")
        toast.success("Table updated successfully!")
      } else {
        response = await fetch(`${API_BASE_URL}/api/tables`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error("Failed to add table.")
        toast.success("Table added successfully!")
      }
      fetchTables()
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error submitting table:", err)
      toast.error(`Failed to ${currentTable ? "update" : "add"} table.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this table?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/tables/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      toast.success("Table deleted successfully!")
      fetchTables()
    } catch (err) {
      console.error("Failed to delete table:", err)
      toast.error("Failed to delete table.")
    }
  }

  if (loading) return <div className="p-4 text-center">Loading tables...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Table Configuration</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Table
        </Button>
      </CardHeader>
      <CardContent>
        {tables.length === 0 ? (
          <div className="text-center text-muted-foreground">No tables configured yet.</div>
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
                  <TableCell>${table.hourlyRate.toFixed(2)}</TableCell>
                  <TableCell>{table.location}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(table)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(table.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentTable ? "Edit Table" : "Add New Table"}</DialogTitle>
            <DialogDescription>
              {currentTable ? "Edit the details of the snooker table." : "Add a new snooker table to your club."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tableName" className="text-right">
                Name
              </Label>
              <Input
                id="tableName"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="hourlyRate" className="text-right">
                Hourly Rate
              </Label>
              <Input
                id="hourlyRate"
                type="number"
                step="0.01"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : currentTable ? "Save Changes" : "Add Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

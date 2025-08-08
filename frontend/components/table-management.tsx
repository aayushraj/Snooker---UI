"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, MapPin, DollarSign, Settings } from "lucide-react"

interface TableConfig {
  id: number
  name: string
  location: string
  hourlyRate: number
  status: "active" | "maintenance" | "disabled"
  description?: string
}

const mockTables: TableConfig[] = [
  {
    id: 1,
    name: "Table 1",
    location: "Main Hall",
    hourlyRate: 25,
    status: "active",
    description: "Standard snooker table",
  },
  {
    id: 2,
    name: "Table 2",
    location: "Main Hall",
    hourlyRate: 25,
    status: "active",
    description: "Standard snooker table",
  },
  {
    id: 3,
    name: "Table 3",
    location: "VIP Room",
    hourlyRate: 35,
    status: "active",
    description: "Premium table with better lighting",
  },
  {
    id: 4,
    name: "Table 4",
    location: "Main Hall",
    hourlyRate: 25,
    status: "maintenance",
    description: "Standard snooker table",
  },
  {
    id: 5,
    name: "Table 5",
    location: "Main Hall",
    hourlyRate: 25,
    status: "active",
    description: "Standard snooker table",
  },
  {
    id: 6,
    name: "Table 6",
    location: "VIP Room",
    hourlyRate: 35,
    status: "active",
    description: "Premium table with better lighting",
  },
]

const locations = ["Main Hall", "VIP Room", "Private Room", "Tournament Hall"]

export function TableManagement() {
  const [tables, setTables] = React.useState<TableConfig[]>(mockTables)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingTable, setEditingTable] = React.useState<TableConfig | null>(null)
  const [formData, setFormData] = React.useState({
    name: "",
    location: "",
    hourlyRate: "",
    status: "active" as const,
    description: "",
  })

  const resetForm = () => {
    setFormData({
      name: "",
      location: "",
      hourlyRate: "",
      status: "active",
      description: "",
    })
  }

  const handleAdd = () => {
    const newTable: TableConfig = {
      id: Math.max(...tables.map((t) => t.id)) + 1,
      name: formData.name,
      location: formData.location,
      hourlyRate: Number.parseFloat(formData.hourlyRate),
      status: formData.status,
      description: formData.description,
    }
    setTables([...tables, newTable])
    setShowAddDialog(false)
    resetForm()
  }

  const handleEdit = (table: TableConfig) => {
    setEditingTable(table)
    setFormData({
      name: table.name,
      location: table.location,
      hourlyRate: table.hourlyRate.toString(),
      status: table.status,
      description: table.description || "",
    })
  }

  const handleUpdate = () => {
    if (!editingTable) return

    const updatedTable: TableConfig = {
      ...editingTable,
      name: formData.name,
      location: formData.location,
      hourlyRate: Number.parseFloat(formData.hourlyRate),
      status: formData.status,
      description: formData.description,
    }

    setTables(tables.map((t) => (t.id === editingTable.id ? updatedTable : t)))
    setEditingTable(null)
    resetForm()
  }

  const handleDelete = (id: number) => {
    setTables(tables.filter((t) => t.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800"
      case "disabled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const activeTables = tables.filter((t) => t.status === "active").length
  const maintenanceTables = tables.filter((t) => t.status === "maintenance").length
  const disabledTables = tables.filter((t) => t.status === "disabled").length
  const averageRate = tables.reduce((sum, t) => sum + t.hourlyRate, 0) / tables.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Table Management</h2>
          <p className="text-muted-foreground">Configure and manage your snooker tables</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
              <DialogDescription>Configure a new snooker table for your club</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Table Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Table 7"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => setFormData({ ...formData, location: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rate">Hourly Rate ($)</Label>
                  <Input
                    id="rate"
                    type="number"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="disabled">Disabled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!formData.name || !formData.location || !formData.hourlyRate}>
                Add Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tables.length}</div>
            <p className="text-xs text-muted-foreground">Configured tables</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Tables</CardTitle>
            <Settings className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{activeTables}</div>
            <p className="text-xs text-green-600">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Maintenance</CardTitle>
            <Settings className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{maintenanceTables}</div>
            <p className="text-xs text-yellow-600">Under maintenance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rate</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averageRate.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Per hour</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tables</CardTitle>
          <CardDescription>Manage your snooker table configurations</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.id}>
                  <TableCell className="font-medium">{table.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      {table.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {table.hourlyRate}/hr
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{table.description || "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(table)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(table.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingTable} onOpenChange={() => setEditingTable(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update table configuration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Table Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => setFormData({ ...formData, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rate">Hourly Rate ($)</Label>
                <Input
                  id="edit-rate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTable(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

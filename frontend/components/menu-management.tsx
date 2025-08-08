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
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Coffee, Utensils, Wine, DollarSign } from "lucide-react"

interface MenuItem {
  id: number
  name: string
  category: "beverages" | "snacks" | "meals" | "alcohol"
  price: number
  description?: string
  available: boolean
}

const mockMenuItems: MenuItem[] = [
  { id: 1, name: "Coffee", category: "beverages", price: 3.5, description: "Fresh brewed coffee", available: true },
  { id: 2, name: "Tea", category: "beverages", price: 2.5, description: "Assorted tea varieties", available: true },
  {
    id: 3,
    name: "Soft Drink",
    category: "beverages",
    price: 2.0,
    description: "Coca-Cola, Pepsi, Sprite",
    available: true,
  },
  {
    id: 4,
    name: "Club Sandwich",
    category: "snacks",
    price: 8.5,
    description: "Triple-decker with chicken and bacon",
    available: true,
  },
  {
    id: 5,
    name: "Fish & Chips",
    category: "meals",
    price: 12.0,
    description: "Beer-battered fish with fries",
    available: true,
  },
  { id: 6, name: "Beer", category: "alcohol", price: 4.5, description: "Local draft beer", available: true },
  {
    id: 7,
    name: "Nachos",
    category: "snacks",
    price: 6.0,
    description: "Tortilla chips with cheese and salsa",
    available: false,
  },
  { id: 8, name: "Burger", category: "meals", price: 10.0, description: "Beef burger with fries", available: true },
]

const categories = [
  { id: "beverages", name: "Beverages", icon: Coffee, color: "bg-blue-100 text-blue-800" },
  { id: "snacks", name: "Snacks", icon: Utensils, color: "bg-green-100 text-green-800" },
  { id: "meals", name: "Meals", icon: Utensils, color: "bg-orange-100 text-orange-800" },
  { id: "alcohol", name: "Alcohol", icon: Wine, color: "bg-purple-100 text-purple-800" },
]

export function MenuManagement() {
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>(mockMenuItems)
  const [showAddDialog, setShowAddDialog] = React.useState(false)
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null)
  const [activeTab, setActiveTab] = React.useState("all")
  const [formData, setFormData] = React.useState({
    name: "",
    category: "beverages" as const,
    price: "",
    description: "",
    available: true,
  })

  const resetForm = () => {
    setFormData({
      name: "",
      category: "beverages",
      price: "",
      description: "",
      available: true,
    })
  }

  const handleAdd = () => {
    const newItem: MenuItem = {
      id: Math.max(...menuItems.map((i) => i.id)) + 1,
      name: formData.name,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      available: formData.available,
    }
    setMenuItems([...menuItems, newItem])
    setShowAddDialog(false)
    resetForm()
  }

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description || "",
      available: item.available,
    })
  }

  const handleUpdate = () => {
    if (!editingItem) return

    const updatedItem: MenuItem = {
      ...editingItem,
      name: formData.name,
      category: formData.category,
      price: Number.parseFloat(formData.price),
      description: formData.description,
      available: formData.available,
    }

    setMenuItems(menuItems.map((i) => (i.id === editingItem.id ? updatedItem : i)))
    setEditingItem(null)
    resetForm()
  }

  const handleDelete = (id: number) => {
    setMenuItems(menuItems.filter((i) => i.id !== id))
  }

  const toggleAvailability = (id: number) => {
    setMenuItems(menuItems.map((item) => (item.id === id ? { ...item, available: !item.available } : item)))
  }

  const filteredItems = activeTab === "all" ? menuItems : menuItems.filter((item) => item.category === activeTab)

  const getCategoryStats = () => {
    return categories.map((category) => ({
      ...category,
      count: menuItems.filter((item) => item.category === category.id).length,
      available: menuItems.filter((item) => item.category === category.id && item.available).length,
    }))
  }

  const totalItems = menuItems.length
  const availableItems = menuItems.filter((item) => item.available).length
  const averagePrice = menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
          <p className="text-muted-foreground">Manage food and beverage offerings</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>Add a new food or beverage item to your menu</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Club Sandwich"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="8.50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the item"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Available for order</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!formData.name || !formData.price}>
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">Menu items</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Available</CardTitle>
            <Utensils className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{availableItems}</div>
            <p className="text-xs text-green-600">Ready to order</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Unavailable</CardTitle>
            <Utensils className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{totalItems - availableItems}</div>
            <p className="text-xs text-red-600">Out of stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePrice.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per item</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        {getCategoryStats().map((category) => {
          const Icon = category.icon
          return (
            <Card key={category.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{category.count}</div>
                <p className="text-xs text-muted-foreground">{category.available} available</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Menu Items */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Items</CardTitle>
          <CardDescription>Manage your food and beverage menu</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Items</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => {
                    const category = categories.find((c) => c.id === item.category)
                    const Icon = category?.icon || Utensils
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge className={category?.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {category?.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {item.price.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {item.description || "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={item.available}
                              onCheckedChange={() => toggleAvailability(item.id)}
                              size="sm"
                            />
                            <Badge
                              className={item.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                            >
                              {item.available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Update menu item details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Item Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price ($)</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-available"
                checked={formData.available}
                onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
              />
              <Label htmlFor="edit-available">Available for order</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Item</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

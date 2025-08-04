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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { PlusCircle, Edit, Trash2 } from "lucide-react"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [category, setCategory] = useState("Beverages")
  const [isAvailable, setIsAvailable] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:5001/api/menu")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: MenuItem[] = await response.json()
      setMenuItems(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Failed to fetch menu items:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMenuItem = () => {
    setCurrentMenuItem(null)
    setName("")
    setDescription("")
    setPrice(0)
    setCategory("Beverages")
    setIsAvailable(true)
    setIsDialogOpen(true)
  }

  const handleEditMenuItem = (item: MenuItem) => {
    setCurrentMenuItem(item)
    setName(item.name)
    setDescription(item.description)
    setPrice(item.price)
    setCategory(item.category)
    setIsAvailable(item.isAvailable)
    setIsDialogOpen(true)
  }

  const handleDeleteMenuItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return

    try {
      const response = await fetch(`https://localhost:5001/api/menu/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Menu Item Deleted!",
        description: "The menu item has been successfully removed.",
        variant: "default",
      })
      fetchMenuItems()
    } catch (error: any) {
      toast({
        title: "Error deleting menu item",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error deleting menu item:", error)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    const itemData = { name, description, price, category, isAvailable }
    const method = currentMenuItem ? "PUT" : "POST"
    const url = currentMenuItem
      ? `https://localhost:5001/api/menu/${currentMenuItem.id}`
      : "https://localhost:5001/api/menu"

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: currentMenuItem ? "Menu Item Updated!" : "Menu Item Added!",
        description: `"${name}" has been ${currentMenuItem ? "updated" : "added"} successfully.`,
        variant: "default",
      })
      setIsDialogOpen(false)
      fetchMenuItems()
    } catch (error: any) {
      toast({
        title: `Error ${currentMenuItem ? "updating" : "adding"} menu item`,
        description: error.message,
        variant: "destructive",
      })
      console.error(`Error ${currentMenuItem ? "updating" : "adding"} menu item:`, error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ["Beverages", "Snacks", "Meals", "Alcohol"]

  if (loading) return <div className="text-center py-8">Loading menu...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Menu Management</h1>
        <Button onClick={handleAddMenuItem}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center text-gray-500">No menu items found. Add some to get started!</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <Card key={item.id} className="shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEditMenuItem(item)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteMenuItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                <p className="text-lg font-bold">${item.price.toFixed(2)}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                    {item.category}
                  </span>
                  <span className={`font-medium ${item.isAvailable ? "text-green-600" : "text-red-600"}`}>
                    {item.isAvailable ? "Available" : "Not Available"}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentMenuItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {currentMenuItem ? "Modify the details of the menu item." : "Enter details for a new menu item."}
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
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number.parseFloat(e.target.value))}
                className="col-span-3"
                required
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="available" className="text-right">
                Available
              </Label>
              <Switch id="available" checked={isAvailable} onCheckedChange={setIsAvailable} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || !name || price <= 0}>
              {loading ? "Saving..." : currentMenuItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

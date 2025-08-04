"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null)
  const [itemName, setItemName] = useState("")
  const [itemDescription, setItemDescription] = useState("")
  const [itemPrice, setItemPrice] = useState("")
  const [itemCategory, setItemCategory] = useState("")
  const [itemIsAvailable, setItemIsAvailable] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchMenuItems = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/menu`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setMenuItems(data)
    } catch (err) {
      console.error("Failed to fetch menu items:", err)
      setError("Failed to load menu items.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const resetForm = () => {
    setCurrentMenuItem(null)
    setItemName("")
    setItemDescription("")
    setItemPrice("")
    setItemCategory("")
    setItemIsAvailable(true)
    setIsSubmitting(false)
  }

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setCurrentMenuItem(item)
      setItemName(item.name)
      setItemDescription(item.description)
      setItemPrice(item.price.toString())
      setItemCategory(item.category)
      setItemIsAvailable(item.isAvailable)
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!itemName || !itemPrice || !itemCategory) {
      toast.error("Name, Price, and Category are required.")
      return
    }
    const price = Number.parseFloat(itemPrice)
    if (isNaN(price) || price <= 0) {
      toast.error("Price must be a positive number.")
      return
    }

    setIsSubmitting(true)
    const payload = {
      name: itemName,
      description: itemDescription,
      price: price,
      category: itemCategory,
      isAvailable: itemIsAvailable,
    }

    try {
      let response
      if (currentMenuItem) {
        response = await fetch(`${API_BASE_URL}/api/menu/${currentMenuItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error("Failed to update menu item.")
        toast.success("Menu item updated successfully!")
      } else {
        response = await fetch(`${API_BASE_URL}/api/menu`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!response.ok) throw new Error("Failed to add menu item.")
        toast.success("Menu item added successfully!")
      }
      fetchMenuItems()
      setDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Error submitting menu item:", err)
      toast.error(`Failed to ${currentMenuItem ? "update" : "add"} menu item.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return

    try {
      const response = await fetch(`${API_BASE_URL}/api/menu/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      toast.success("Menu item deleted successfully!")
      fetchMenuItems()
    } catch (err) {
      console.error("Failed to delete menu item:", err)
      toast.error("Failed to delete menu item.")
    }
  }

  if (loading) return <div className="p-4 text-center">Loading menu...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Management</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </CardHeader>
      <CardContent>
        {menuItems.length === 0 ? (
          <div className="text-center text-muted-foreground">No menu items added yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Available</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description}</TableCell>
                  <TableCell>
                    <Switch checked={item.isAvailable} disabled />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} className="mr-2">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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
            <DialogTitle>{currentMenuItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            <DialogDescription>
              {currentMenuItem ? "Edit the details of the menu item." : "Add a new item to your club's menu."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemName" className="text-right">
                Name
              </Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemDescription" className="text-right">
                Description
              </Label>
              <Textarea
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemPrice" className="text-right">
                Price
              </Label>
              <Input
                id="itemPrice"
                type="number"
                step="0.01"
                value={itemPrice}
                onChange={(e) => setItemPrice(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemCategory" className="text-right">
                Category
              </Label>
              <Input
                id="itemCategory"
                value={itemCategory}
                onChange={(e) => setItemCategory(e.target.value)}
                className="col-span-3"
                disabled={isSubmitting}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemIsAvailable" className="text-right">
                Available
              </Label>
              <Switch
                id="itemIsAvailable"
                checked={itemIsAvailable}
                onCheckedChange={setItemIsAvailable}
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
              {isSubmitting ? "Saving..." : currentMenuItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

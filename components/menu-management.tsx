"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Edit, PlusCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

const menuCategories = ["Beverages", "Snacks", "Meals", "Alcohol"];

export function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [itemCategory, setItemCategory] = useState(menuCategories[0]);
  const [isItemAvailable, setIsItemAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState(menuCategories[0]);
  const { toast } = useToast();

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/menu');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: MenuItem[] = await response.json();
      setMenuItems(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleOpenDialog = (item?: MenuItem) => {
    setCurrentMenuItem(item || null);
    setItemName(item?.name || "");
    setItemDescription(item?.description || "");
    setItemPrice(item?.price || 0);
    setItemCategory(item?.category || menuCategories[0]);
    setIsItemAvailable(item?.isAvailable ?? true);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCurrentMenuItem(null);
    setItemName("");
    setItemDescription("");
    setItemPrice(0);
    setItemCategory(menuCategories[0]);
    setIsItemAvailable(true);
  };

  const handleSubmit = async () => {
    if (!itemName.trim() || itemPrice <= 0 || !itemCategory.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    const itemData = {
      name: itemName,
      description: itemDescription,
      price: itemPrice,
      category: itemCategory,
      isAvailable: isItemAvailable,
    };
    let response;
    let method;
    let url;

    if (currentMenuItem) {
      // Update existing item
      method = 'PUT';
      url = `https://localhost:5001/api/menu/${currentMenuItem.id}`;
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentMenuItem.id, ...itemData }),
      });
    } else {
      // Create new item
      method = 'POST';
      url = 'https://localhost:5001/api/menu';
      response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
    }

    if (response.ok) {
      toast({
        title: "Success",
        description: `Menu item ${currentMenuItem ? "updated" : "created"} successfully.`,
      });
      fetchMenuItems();
      handleCloseDialog();
    } else {
      const errorData = await response.json();
      toast({
        title: "Error",
        description: `Failed to ${currentMenuItem ? "update" : "create"} menu item: ${errorData.message || response.statusText}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) {
      return;
    }
    try {
      const response = await fetch(`https://localhost:5001/api/menu/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: "Success",
          description: "Menu item deleted successfully.",
        });
        fetchMenuItems();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || response.statusText);
      }
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to delete menu item: ${e.message}`,
        variant: "destructive",
      });
    }
  };

  const filteredItems = menuItems.filter(item => item.category === activeTab);

  if (loading) return <div className="text-center py-12">Loading menu items...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Menu Management</CardTitle>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {menuCategories.map(category => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
          {menuCategories.map(category => (
            <TabsContent key={category} value={category} className="mt-4">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No {category.toLowerCase()} items yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.description}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.isAvailable ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentMenuItem ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
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
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemDescription" className="text-right">
                Description
              </Label>
              <Input
                id="itemDescription"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemPrice" className="text-right">
                Price
              </Label>
              <Input
                id="itemPrice"
                type="number"
                value={itemPrice}
                onChange={(e) => setItemPrice(parseFloat(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="itemCategory" className="text-right">
                Category
              </Label>
              <Select value={itemCategory} onValueChange={setItemCategory}>
                <SelectTrigger id="itemCategory" className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {menuCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isAvailable" className="text-right">
                Available
              </Label>
              <Switch
                id="isAvailable"
                checked={isItemAvailable}
                onCheckedChange={setIsItemAvailable}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {currentMenuItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

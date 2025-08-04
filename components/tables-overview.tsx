"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
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
import { Search, Play, Pause, StopCircle, Utensils, Users } from "lucide-react"
import CustomerCreationDialog from "./customer-creation-dialog"
import SnookerTableTimer from "./snooker-table-timer"
import { useToast } from "@/components/ui/use-toast"

interface Customer {
  id: string
  name: string
  membershipType: string
  discountPercentage: number
}

interface Session {
  id: string
  tableId: string
  customerId: string
  customer: Customer
  startTime: string
  endTime: string | null
  pausedDuration: number // in milliseconds
  pausedAt: string | null
  status: "Active" | "Paused" | "Ended"
  hourlyRate: number
  discountPercentage: number
  tableCharges: number
  orderCharges: number
  subtotal: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  grandTotal: number
}

interface Table {
  id: string
  name: string
  hourlyRate: number
  location: string
  currentSession: Session | null
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

interface OrderItemRequest {
  menuItemId: string
  quantity: number
}

interface OrderRequest {
  sessionId: string
  items: OrderItemRequest[]
}

interface Order {
  id: string
  sessionId: string
  orderTime: string
  orderItems: {
    id: string
    menuItemId: string
    quantity: number
    menuItem: MenuItem
  }[]
}

export default function TablesOverview() {
  const [tables, setTables] = useState<Table[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStartSessionDialogOpen, setIsStartSessionDialogOpen] = useState(false)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [isCustomerCreationDialogOpen, setIsCustomerCreationDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentOrderItems, setCurrentOrderItems] = useState<{ menuItem: MenuItem; quantity: number }[]>([])
  const { toast } = useToast()

  const categories = ["All", "Beverages", "Snacks", "Meals", "Alcohol"]

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000) // Refresh every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [tablesRes, customersRes, menuRes] = await Promise.all([
        fetch("https://localhost:5001/api/tables"),
        fetch("https://localhost:5001/api/customers"),
        fetch("https://localhost:5001/api/menu"),
      ])

      if (!tablesRes.ok) throw new Error(`HTTP error! status: ${tablesRes.status} for tables`)
      if (!customersRes.ok) throw new Error(`HTTP error! status: ${customersRes.status} for customers`)
      if (!menuRes.ok) throw new Error(`HTTP error! status: ${menuRes.status} for menu`)

      const tablesData: Table[] = await tablesRes.json()
      const customersData: Customer[] = await customersRes.json()
      const menuData: MenuItem[] = await menuRes.json()

      setTables(tablesData)
      setCustomers(customersData)
      setMenuItems(menuData)
    } catch (err: any) {
      setError(err.message)
      console.error("Failed to fetch data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartSessionClick = (tableId: string) => {
    setSelectedTableId(tableId)
    setSelectedCustomerId(null) // Reset customer selection
    setIsStartSessionDialogOpen(true)
  }

  const handleStartSession = async () => {
    if (!selectedTableId || !selectedCustomerId) {
      toast({
        title: "Missing Information",
        description: "Please select both a table and a customer.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("https://localhost:5001/api/sessions/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableId: selectedTableId, customerId: selectedCustomerId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Session Started!",
        description: `Table ${tables.find((t) => t.id === selectedTableId)?.name} is now active.`,
        variant: "default",
      })
      setIsStartSessionDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error starting session",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error starting session:", error)
    }
  }

  const handlePauseResumeSession = async (sessionId: string, currentStatus: "Active" | "Paused") => {
    const action = currentStatus === "Active" ? "pause" : "resume"
    try {
      const response = await fetch(`https://localhost:5001/api/sessions/${sessionId}/${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: `Session ${action === "pause" ? "Paused" : "Resumed"}!`,
        description: `The session has been ${action === "pause" ? "paused" : "resumed"}.`,
        variant: "default",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: `Error ${action}ing session`,
        description: error.message,
        variant: "destructive",
      })
      console.error(`Error ${action}ing session:`, error)
    }
  }

  const handleEndSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to end this session and generate a bill?")) return

    try {
      const response = await fetch(`https://localhost:5001/api/sessions/${sessionId}/end`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      const bill = await response.json()
      toast({
        title: "Session Ended & Bill Generated!",
        description: `Total amount: $${bill.grandTotal.toFixed(2)}.`,
        variant: "default",
        duration: 5000,
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Error ending session",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error ending session:", error)
    }
  }

  const handleOrderFoodClick = (tableId: string) => {
    setSelectedTableId(tableId)
    setCurrentOrderItems([]) // Reset current order
    setIsOrderDialogOpen(true)
  }

  const handleQuantityChange = (menuItem: MenuItem, change: number) => {
    setCurrentOrderItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex((item) => item.menuItem.id === menuItem.id)
      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems]
        const newQuantity = updatedItems[existingItemIndex].quantity + change
        if (newQuantity > 0) {
          updatedItems[existingItemIndex] = { ...updatedItems[existingItemIndex], quantity: newQuantity }
        } else {
          updatedItems.splice(existingItemIndex, 1) // Remove if quantity is 0 or less
        }
        return updatedItems
      } else if (change > 0) {
        return [...prevItems, { menuItem, quantity: change }]
      }
      return prevItems
    })
  }

  const handlePlaceOrder = async () => {
    if (!selectedTableId) return

    const table = tables.find((t) => t.id === selectedTableId)
    const sessionId = table?.currentSession?.id

    if (!sessionId) {
      toast({
        title: "Error",
        description: "No active session found for this table.",
        variant: "destructive",
      })
      return
    }

    if (currentOrderItems.length === 0) {
      toast({
        title: "No Items",
        description: "Please add items to your order.",
        variant: "destructive",
      })
      return
    }

    const orderItemsPayload = currentOrderItems.map((item) => ({
      menuItemId: item.menuItem.id,
      quantity: item.quantity,
    }))

    try {
      const response = await fetch("https://localhost:5001/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, items: orderItemsPayload }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Order Placed!",
        description: `Order for Table ${table?.name} has been placed.`,
        variant: "default",
      })
      setIsOrderDialogOpen(false)
      fetchData() // Refresh data to show updated order charges if applicable
    } catch (error: any) {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error placing order:", error)
    }
  }

  const filteredMenuItems = menuItems.filter(
    (item) => item.isAvailable && (selectedCategory === "All" || item.category === selectedCategory),
  )

  const calculateOrderTotal = () => {
    return currentOrderItems.reduce((total, item) => total + item.menuItem.price * item.quantity, 0)
  }

  const filteredTables = tables.filter((table) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    const matchesName = table.name.toLowerCase().includes(lowerCaseSearchTerm)
    const matchesLocation = table.location.toLowerCase().includes(lowerCaseSearchTerm)
    const matchesCustomer = table.currentSession?.customer?.name.toLowerCase().includes(lowerCaseSearchTerm)
    const matchesStatus =
      table.currentSession?.status.toLowerCase().includes(lowerCaseSearchTerm) ||
      (table.currentSession === null && "available".includes(lowerCaseSearchTerm))

    return matchesName || matchesLocation || matchesCustomer || matchesStatus
  })

  if (loading) return <div className="text-center py-8">Loading tables...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tables Overview</h1>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search tables by name, customer, status..."
            className="pl-10 pr-4 py-2 rounded-md border border-gray-300 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredTables.length === 0 && searchTerm !== "" ? (
        <div className="text-center text-gray-500 py-8">No tables match your search criteria.</div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No tables available. Please add tables in settings.</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredTables.map((table) => (
            <Card key={table.id} className="shadow-lg flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">{table.name}</CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    table.currentSession?.status === "Active"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : table.currentSession?.status === "Paused"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  }`}
                >
                  {table.currentSession ? table.currentSession.status : "Available"}
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Location: {table.location}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hourly Rate: ${table.hourlyRate.toFixed(2)}</p>
                {table.currentSession && (
                  <>
                    <p className="text-md font-medium">
                      Customer: {table.currentSession.customer.name} ({table.currentSession.customer.membershipType})
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-md font-medium">Time:</span>
                      <SnookerTableTimer
                        startTime={table.currentSession.startTime}
                        pausedAt={table.currentSession.pausedAt}
                        pausedDuration={table.currentSession.pausedDuration}
                        status={table.currentSession.status}
                      />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Discount: {table.currentSession.discountPercentage * 100}%
                    </p>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-4">
                {table.currentSession ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <Button
                        variant="outline"
                        onClick={() => handlePauseResumeSession(table.currentSession!.id, table.currentSession!.status)}
                      >
                        {table.currentSession.status === "Active" ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> Pause
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> Resume
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => handleOrderFoodClick(table.id)}>
                        <Utensils className="mr-2 h-4 w-4" /> Order Food
                      </Button>
                    </div>
                    <Button className="w-full" onClick={() => handleEndSession(table.currentSession!.id)}>
                      <StopCircle className="mr-2 h-4 w-4" /> End Session
                    </Button>
                  </>
                ) : (
                  <Button className="w-full" onClick={() => handleStartSessionClick(table.id)}>
                    <Play className="mr-2 h-4 w-4" /> Start Session
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Start Session Dialog */}
      <Dialog open={isStartSessionDialogOpen} onOpenChange={setIsStartSessionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Session for Table {tables.find((t) => t.id === selectedTableId)?.name}</DialogTitle>
            <DialogDescription>Select a customer to start a new session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Select onValueChange={setSelectedCustomerId} value={selectedCustomerId || ""}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.membershipType})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={() => setIsCustomerCreationDialogOpen(true)}>
              <Users className="mr-2 h-4 w-4" /> Create New Customer
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartSessionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartSession} disabled={!selectedCustomerId}>
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Food Dialog */}
      <Dialog open={isOrderDialogOpen} onOpenChange={setIsOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Order Food for Table {tables.find((t) => t.id === selectedTableId)?.name}</DialogTitle>
            <DialogDescription>Select menu items and quantities for the current session.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-hidden">
            {/* Menu Items Section */}
            <div className="flex flex-col border-r pr-4 overflow-auto">
              <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="mb-4">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="space-y-2 overflow-y-auto pr-2">
                {filteredMenuItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items in this category or no items available.</p>
                ) : (
                  filteredMenuItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => handleQuantityChange(item, -1)}
                        >
                          -
                        </Button>
                        <span className="font-medium w-6 text-center">
                          {currentOrderItems.find((orderItem) => orderItem.menuItem.id === item.id)?.quantity || 0}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 bg-transparent"
                          onClick={() => handleQuantityChange(item, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Current Order Section */}
            <div className="flex flex-col pl-4 overflow-auto">
              <h3 className="text-lg font-semibold mb-2">Current Order</h3>
              <div className="space-y-2 flex-grow overflow-y-auto pr-2">
                {currentOrderItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items added to order yet.</p>
                ) : (
                  currentOrderItems.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <p className="font-medium">{item.menuItem.name}</p>
                        <p className="text-sm text-gray-500">
                          ${item.menuItem.price.toFixed(2)} x {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-right">
                <p className="text-xl font-bold">Total: ${calculateOrderTotal().toFixed(2)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOrderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={currentOrderItems.length === 0}>
              Place Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Creation Dialog */}
      <CustomerCreationDialog
        isOpen={isCustomerCreationDialogOpen}
        onClose={() => setIsCustomerCreationDialogOpen(false)}
        onCustomerCreated={(newCustomer) => {
          setCustomers((prev) => [...prev, newCustomer])
          setSelectedCustomerId(newCustomer.id) // Auto-select new customer
          setIsCustomerCreationDialogOpen(false)
        }}
      />
    </div>
  )
}

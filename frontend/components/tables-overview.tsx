"use client"

import { CardFooter } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { SnookerTableTimer } from "./snooker-table-timer"
import { Plus, Utensils, DollarSign } from 'lucide-react'
import { Separator } from "@/components/ui/separator"
import { parseTimeSpanToMilliseconds } from "@/lib/utils"

interface Table {
  id: string
  name: string
  hourlyRate: number
  location: string
  currentSession: Session | null
}

interface Customer {
  id: string
  name: string
  membershipType: string
  discountPercentage: number
}

interface Session {
  id: string
  tableId: string
  table: Table // Added table object to session
  customerId: string
  customer: Customer
  startTime: string
  endTime: string | null
  pausedDuration: string // TimeSpan from C# is string in JSON
  pausedAt: string | null
  status: "Active" | "Paused" | "Ended"
  hourlyRate: number
  discountPercentage: number
  orders: Order[]
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  isAvailable: boolean
}

interface OrderItem {
  id: string
  menuItemId: string
  menuItem: MenuItem
  quantity: number
}

interface Order {
  id: string
  sessionId: string
  orderTime: string
  orderItems: OrderItem[]
}

interface BillOrderItem {
  quantity: number
  menuItemName: string
  price: number
  total: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function TablesOverview() {
  const [tables, setTables] = useState<Table[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [startSessionDialogOpen, setStartSessionDialogOpen] = useState(false)
  const [selectedTableForSession, setSelectedTableForSession] = useState<Table | null>(null)
  const [selectedCustomerForSession, setSelectedCustomerForSession] = useState<string>("")
  const [isStartingSession, setIsStartingSession] = useState(false)

  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedSessionForOrder, setSelectedSessionForOrder] = useState<Session | null>(null)
  const [orderQuantities, setOrderQuantities] = useState<{ [key: string]: number }>({})
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  const [billDialogOpen, setBillDialogOpen] = useState(false)
  const [currentBill, setCurrentBill] = useState<any>(null) // Type this properly if needed
  const [isEndingSession, setIsEndingSession] = useState(false)

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
      setError("Failed to load tables.")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setCustomers(data)
    } catch (err) {
      console.error("Failed to fetch customers:", err)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setMenuItems(data.filter((item: MenuItem) => item.isAvailable))
    } catch (err) {
      console.error("Failed to fetch menu items:", err)
    }
  }

  useEffect(() => {
    fetchTables()
    fetchCustomers()
    fetchMenuItems()

    const interval = setInterval(fetchTables, 5000) // Refresh tables every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const handleStartSessionClick = (table: Table) => {
    setSelectedTableForSession(table)
    setStartSessionDialogOpen(true)
  }

  const handleStartSession = async () => {
    if (!selectedTableForSession || !selectedCustomerForSession) {
      toast.error("Please select a customer.")
      return
    }

    setIsStartingSession(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: selectedTableForSession.id,
          customerId: selectedCustomerForSession,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      toast.success(`Session started for ${selectedTableForSession.name}!`)
      setStartSessionDialogOpen(false)
      setSelectedCustomerForSession("")
      fetchTables() // Refresh tables to show new session
    } catch (error: any) {
      console.error("Failed to start session:", error)
      toast.error(`Failed to start session: ${error.message || "Unknown error"}`)
    } finally {
      setIsStartingSession(false)
    }
  }

  const handlePauseResume = async (session: Session) => {
    const action = session.status === "Active" ? "pause" : "resume"
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${session.id}/${action}`, {
        method: "POST",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }
      toast.success(`Session ${action}d successfully!`)
      fetchTables()
    } catch (error: any) {
      console.error(`Failed to ${action} session:`, error)
      toast.error(`Failed to ${action} session: ${error.message || "Unknown error"}`)
    }
  }

  const handleEndSessionClick = async (session: Session) => {
    if (!confirm(`Are you sure you want to end the session for ${session.table.name}?`)) {
      return
    }
    setIsEndingSession(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions/${session.id}/end`, {
        method: "POST",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }
      const bill = await response.json()
      setCurrentBill(bill)
      setBillDialogOpen(true)
      toast.success(`Session ended for ${session.table.name}! Bill generated.`)
      fetchTables() // Refresh tables to show table as available
    } catch (error: any) {
      console.error("Failed to end session:", error)
      toast.error(`Failed to end session: ${error.message || "Unknown error"}`)
    } finally {
      setIsEndingSession(false)
    }
  }

  const handleAddOrderClick = (session: Session) => {
    setSelectedSessionForOrder(session)
    setOrderQuantities(menuItems.reduce((acc, item) => ({ ...acc, [item.id]: 0 }), {}))
    setOrderDialogOpen(true)
  }

  const handleQuantityChange = (menuItemId: string, quantity: number) => {
    setOrderQuantities((prev) => ({
      ...prev,
      [menuItemId]: Math.max(0, quantity), // Ensure quantity is not negative
    }))
  }

  const handlePlaceOrder = async () => {
    if (!selectedSessionForOrder) return

    const itemsToOrder = Object.entries(orderQuantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity }))

    if (itemsToOrder.length === 0) {
      toast.error("Please add at least one item to the order.")
      return
    }

    setIsPlacingOrder(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: selectedSessionForOrder.id,
          items: itemsToOrder,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      toast.success("Order placed successfully!")
      setOrderDialogOpen(false)
      fetchTables() // Refresh tables to update session data with new orders
    } catch (error: any) {
      console.error("Failed to place order:", error)
      toast.error(`Failed to place order: ${error.message || "Unknown error"}`)
    } finally {
      setIsPlacingOrder(false)
    }
  }

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">Loading tables...</div>
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tables.map((table) => (
        <Card key={table.id} className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{table.name}</span>
              <span className="text-sm text-muted-foreground">${table.hourlyRate.toFixed(2)}/hr</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            {table.currentSession ? (
              <div className="space-y-2">
                <p>
                  **Customer:** {table.currentSession.customer.name} ({table.currentSession.customer.membershipType})
                </p>
                <SnookerTableTimer
                  startTime={table.currentSession.startTime}
                  pausedDurationMs={parseTimeSpanToMilliseconds(table.currentSession.pausedDuration)}
                  status={table.currentSession.status}
                />
                {table.currentSession.orders && table.currentSession.orders.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-sm mb-1">Current Orders:</h4>
                    <ul className="text-xs text-muted-foreground">
                      {table.currentSession.orders
                        .flatMap((order) => order.orderItems)
                        .map((item, index) => (
                          <li key={index}>
                            {item.quantity}x {item.menuItem.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Available</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            {table.currentSession ? (
              <>
                <div className="flex w-full gap-2">
                  <Button
                    className="flex-1"
                    variant={table.currentSession.status === "Active" ? "secondary" : "default"}
                    onClick={() => handlePauseResume(table.currentSession!)}
                    disabled={isEndingSession}
                  >
                    {table.currentSession.status === "Active" ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    className="flex-1 bg-transparent"
                    variant="outline"
                    onClick={() => handleAddOrderClick(table.currentSession!)}
                    disabled={table.currentSession.status === "Paused" || isEndingSession}
                  >
                    <Utensils className="mr-2 h-4 w-4" /> Add Order
                  </Button>
                </div>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => handleEndSessionClick(table.currentSession!)}
                  disabled={isEndingSession}
                >
                  <DollarSign className="mr-2 h-4 w-4" /> {isEndingSession ? "Ending..." : "End Session & Bill"}
                </Button>
              </>
            ) : (
              <Button
                className="w-full bg-snooker-green hover:bg-snooker-green/90 text-snooker-green-foreground"
                onClick={() => handleStartSessionClick(table)}
              >
                <Plus className="mr-2 h-4 w-4" /> Start Session
              </Button>
            )}
          </CardFooter>
        </Card>
      ))}

      {/* Start Session Dialog */}
      <Dialog open={startSessionDialogOpen} onOpenChange={setStartSessionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Session for {selectedTableForSession?.name}</DialogTitle>
            <DialogDescription>Select a customer to start a new session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="customer" className="text-right">
                Customer
              </Label>
              <Select
                onValueChange={setSelectedCustomerForSession}
                value={selectedCustomerForSession}
                disabled={isStartingSession}
              >
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStartSessionDialogOpen(false)} disabled={isStartingSession}>
              Cancel
            </Button>
            <Button onClick={handleStartSession} disabled={isStartingSession || !selectedCustomerForSession}>
              {isStartingSession ? "Starting..." : "Start Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Order for {selectedSessionForOrder?.table.name}</DialogTitle>
            <DialogDescription>Select menu items and quantities for the current session.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[400px] overflow-y-auto">
            {menuItems.length === 0 ? (
              <p className="text-center text-muted-foreground">No menu items available.</p>
            ) : (
              menuItems.map((item) => (
                <div key={item.id} className="grid grid-cols-5 items-center gap-4">
                  <Label className="col-span-2">
                    {item.name} (${item.price.toFixed(2)})
                  </Label>
                  <Input
                    type="number"
                    value={orderQuantities[item.id] || 0}
                    onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value))}
                    className="col-span-2"
                    min="0"
                    disabled={isPlacingOrder}
                  />
                  <span className="text-sm text-muted-foreground text-right">
                    Total: ${(item.price * (orderQuantities[item.id] || 0)).toFixed(2)}
                  </span>
                </div>
              ))
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOrderDialogOpen(false)} disabled={isPlacingOrder}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={isPlacingOrder}>
              {isPlacingOrder ? "Placing..." : "Place Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bill Display Dialog */}
      <Dialog open={billDialogOpen} onOpenChange={setBillDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bill for {currentBill?.tableName}</DialogTitle>
            <DialogDescription>Detailed breakdown of charges for the session.</DialogDescription>
          </DialogHeader>
          {currentBill && (
            <div className="grid gap-4 py-4 text-sm">
              <p>
                **Customer:** {currentBill.customerName} ({currentBill.membershipType})
              </p>
              <p>**Session Duration:** {(currentBill.durationMilliseconds / 3600000).toFixed(2)} hours</p>
              <Separator />
              <h4 className="font-semibold">Table Charges: ${currentBill.tableCharges.toFixed(2)}</h4>
              <h4 className="font-semibold">Order Details:</h4>
              {currentBill.orderItems.length > 0 ? (
                <ul className="list-disc pl-5">
                  {currentBill.orderItems.map((item: any, index: number) => (
                    <li key={index}>
                      {item.quantity}x {item.menuItemName} @ ${item.price.toFixed(2)} each = ${item.total.toFixed(2)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No orders placed.</p>
              )}
              <p>**Total Order Charges:** ${currentBill.orderCharges.toFixed(2)}</p>
              <Separator />
              <p>**Subtotal:** ${currentBill.subtotal.toFixed(2)}</p>
              <p className="text-green-600">
                **Discount ({currentBill.discountPercentage * 100}%):** -${currentBill.discountAmount.toFixed(2)}
              </p>
              <p>
                **Tax ({currentBill.taxRate * 100}%):** ${currentBill.taxAmount.toFixed(2)}
              </p>
              <Separator />
              <h3 className="text-lg font-bold">**Grand Total:** ${currentBill.grandTotal.toFixed(2)}</h3>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setBillDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

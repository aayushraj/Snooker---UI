"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Settings, Plus, UtensilsCrossed } from "lucide-react"
import { CustomerCreationDialog } from "@/components/customer-creation-dialog"
import { OrderDialog } from "@/components/order-dialog" // Import the new OrderDialog

// Mock API calls (replace with actual API calls)
const fetchTables = async () => {
  // In a real app, this would fetch from your .NET backend
  return [
    {
      id: "1",
      name: "Table 1",
      location: "Main Hall",
      status: "available",
      currentSession: null,
      hourlyRate: 10,
    },
    {
      id: "2",
      name: "Table 2",
      location: "VIP Room",
      status: "occupied",
      currentSession: {
        id: "s1",
        customerId: "c1",
        customerName: "Alice Smith",
        membership: "Premium",
        startTime: Date.now() - 3600000, // 1 hour ago
        pausedTime: 0,
        status: "active",
      },
      hourlyRate: 15,
    },
    {
      id: "3",
      name: "Table 3",
      location: "Main Hall",
      status: "paused",
      currentSession: {
        id: "s2",
        customerId: "c2",
        customerName: "Bob Johnson",
        membership: "Basic",
        startTime: Date.now() - 7200000, // 2 hours ago
        pausedTime: 1800000, // 30 minutes paused
        status: "paused",
      },
      hourlyRate: 10,
    },
    {
      id: "4",
      name: "Table 4",
      location: "Main Hall",
      status: "reserved",
      currentSession: null,
      hourlyRate: 10,
    },
    {
      id: "5",
      name: "Table 5",
      location: "VIP Room",
      status: "available",
      currentSession: null,
      hourlyRate: 15,
    },
  ]
}

const startSession = async (tableId, customerId, customerName, membership) => {
  console.log(`Starting session for Table ${tableId} with Customer ${customerName} (${membership})`)
  // Simulate API call
  return {
    id: `s${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    customerName,
    membership,
    startTime: Date.now(),
    pausedTime: 0,
    status: "active",
  }
}

const pauseSession = async (sessionId) => {
  console.log(`Pausing session ${sessionId}`)
  // Simulate API call
  return { status: "paused", pausedTime: Date.now() } // In real app, calculate actual paused duration
}

const resumeSession = async (sessionId) => {
  console.log(`Resuming session ${sessionId}`)
  // Simulate API call
  return { status: "active" }
}

const endSession = async (sessionId) => {
  console.log(`Ending session ${sessionId}`)
  // Simulate API call
  return { success: true, billId: `b${Math.random().toString(36).substr(2, 9)}` }
}

const placeOrder = async (sessionId, items) => {
  console.log(`Placing order for session ${sessionId}:`, items)
  // Simulate API call
  return { success: true, orderId: `o${Math.random().toString(36).substr(2, 9)}` }
}

const getStatusColor = (status) => {
  switch (status) {
    case "occupied":
      return "bg-green-500"
    case "available":
      return "bg-blue-500"
    case "paused":
      return "bg-yellow-500"
    case "reserved":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${hours > 0 ? `${hours}h ` : ""}${minutes > 0 ? `${minutes}m ` : ""}${seconds}s`.trim()
}

export function TablesOverview({ onNavigateToSettings }) {
  const [tables, setTables] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [selectedTableForCustomer, setSelectedTableForCustomer] = useState(null)
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false)
  const [selectedSessionForOrder, setSelectedSessionForOrder] = useState(null)

  useEffect(() => {
    const loadTables = async () => {
      const data = await fetchTables()
      setTables(data)
    }
    loadTables()

    const interval = setInterval(() => {
      setTables((prevTables) =>
        prevTables.map((table) => {
          if (table.status === "occupied" && table.currentSession) {
            const elapsed = Date.now() - table.currentSession.startTime - table.currentSession.pausedTime
            return {
              ...table,
              currentSession: {
                ...table.currentSession,
                elapsedTime: elapsed,
              },
            }
          }
          return table
        }),
      )
    }, 1000) // Update every second for the timer

    return () => clearInterval(interval)
  }, [])

  const handleStartSessionClick = (table) => {
    setSelectedTableForCustomer(table)
    setIsCustomerDialogOpen(true)
  }

  const handleCustomerCreated = async (customer) => {
    if (selectedTableForCustomer) {
      const newSession = await startSession(
        selectedTableForCustomer.id,
        customer.id,
        customer.name,
        customer.membership,
      )
      setTables((prevTables) =>
        prevTables.map((table) =>
          table.id === selectedTableForCustomer.id
            ? { ...table, status: "occupied", currentSession: { ...newSession, elapsedTime: 0 } }
            : table,
        ),
      )
    }
    setIsCustomerDialogOpen(false)
    setSelectedTableForCustomer(null)
  }

  const handlePauseResume = async (table) => {
    if (!table.currentSession) return

    if (table.currentSession.status === "active") {
      const updatedSession = await pauseSession(table.currentSession.id)
      setTables((prevTables) =>
        prevTables.map((t) =>
          t.id === table.id
            ? {
                ...t,
                status: "paused",
                currentSession: {
                  ...t.currentSession,
                  status: updatedSession.status,
                  pausedTime:
                    t.currentSession.pausedTime +
                    (Date.now() -
                      t.currentSession.startTime -
                      t.currentSession.pausedTime -
                      (t.currentSession.elapsedTime || 0)), // Accumulate paused time
                },
              }
            : t,
        ),
      )
    } else {
      await resumeSession(table.currentSession.id)
      setTables((prevTables) =>
        prevTables.map((t) =>
          t.id === table.id
            ? {
                ...t,
                status: "occupied",
                currentSession: {
                  ...t.currentSession,
                  status: "active",
                  startTime: Date.now() - (t.currentSession.elapsedTime || 0) - t.currentSession.pausedTime, // Adjust start time to account for total elapsed time
                },
              }
            : t,
        ),
      )
    }
  }

  const handleEndSession = async (table) => {
    if (!table.currentSession) return

    await endSession(table.currentSession.id)
    setTables((prevTables) =>
      prevTables.map((t) => (t.id === table.id ? { ...t, status: "available", currentSession: null } : t)),
    )
  }

  const handleOrderFoodClick = (table) => {
    if (table.currentSession) {
      setSelectedSessionForOrder(table.currentSession)
      setIsOrderDialogOpen(true)
    }
  }

  const handleOrderPlaced = async (items) => {
    if (selectedSessionForOrder) {
      await placeOrder(selectedSessionForOrder.id, items)
    }
    setIsOrderDialogOpen(false)
    setSelectedSessionForOrder(null)
  }

  const filteredTables = tables.filter((table) => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return (
      table.name.toLowerCase().includes(lowerCaseSearchTerm) ||
      table.location.toLowerCase().includes(lowerCaseSearchTerm) ||
      table.status.toLowerCase().includes(lowerCaseSearchTerm) ||
      (table.currentSession && table.currentSession.customerName.toLowerCase().includes(lowerCaseSearchTerm))
    )
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tables Overview</h1>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Search tables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon" onClick={onNavigateToSettings}>
            <Settings className="h-4 w-4" />
            <span className="sr-only">Table Settings</span>
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredTables.length > 0 ? (
          filteredTables.map((table) => (
            <Card key={table.id} className="flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium">{table.name}</CardTitle>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-semibold text-white ${getStatusColor(table.status)}`}
                >
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{table.location}</p>
                  {table.currentSession && (
                    <div className="mt-2 text-sm">
                      <p>
                        <span className="font-semibold">Customer:</span> {table.currentSession.customerName}
                      </p>
                      <p>
                        <span className="font-semibold">Membership:</span> {table.currentSession.membership}
                      </p>
                      <p className="font-mono text-lg text-green-600">
                        {formatTime(table.currentSession.elapsedTime || 0)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  {table.status === "available" && (
                    <Button onClick={() => handleStartSessionClick(table)}>
                      <Plus className="mr-2 h-4 w-4" /> Start Session
                    </Button>
                  )}
                  {(table.status === "occupied" || table.status === "paused") && (
                    <>
                      <Button onClick={() => handlePauseResume(table)}>
                        {table.currentSession?.status === "active" ? "Pause Session" : "Resume Session"}
                      </Button>
                      <Button variant="outline" onClick={() => handleOrderFoodClick(table)}>
                        <UtensilsCrossed className="mr-2 h-4 w-4" /> Order Food
                      </Button>
                      <Button variant="destructive" onClick={() => handleEndSession(table)}>
                        End Session
                      </Button>
                    </>
                  )}
                  {table.status === "reserved" && (
                    <Button variant="secondary" disabled>
                      Reserved
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No tables found matching your search.
          </div>
        )}
      </div>

      <CustomerCreationDialog
        isOpen={isCustomerDialogOpen}
        onClose={() => setIsCustomerDialogOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      <OrderDialog
        isOpen={isOrderDialogOpen}
        onClose={() => setIsOrderDialogOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        sessionId={selectedSessionForOrder?.id || ""}
      />
    </div>
  )
}

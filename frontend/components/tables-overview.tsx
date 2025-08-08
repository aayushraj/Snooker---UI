"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Clock, DollarSign, Play, Pause, Square, StopCircle, User, Plus, Settings } from "lucide-react"
import { CustomerCreationDialog } from "@/components/customer-creation-dialog"

interface Table {
  id: number
  name: string
  status: "available" | "occupied" | "paused" | "reserved"
  location: string
  hourlyRate: number
  currentSession?: {
    id: number
    customerName: string
    customerPhone: string
    membershipPlan: string
    startTime: string
    pausedTime?: number
    totalAmount: number
    discount: number
  }
}

interface Customer {
  name: string
  phone: string
  email: string
  membershipPlan: string
}

const mockTables: Table[] = [
  {
    id: 1,
    name: "Table 1",
    status: "occupied",
    location: "Main Hall",
    hourlyRate: 25,
    currentSession: {
      id: 1,
      customerName: "John Smith",
      customerPhone: "+1-555-0123",
      membershipPlan: "premium",
      startTime: "2024-01-08T14:30:00Z",
      totalAmount: 37.5,
      discount: 10,
    },
  },
  {
    id: 2,
    name: "Table 2",
    status: "paused",
    location: "Main Hall",
    hourlyRate: 25,
    currentSession: {
      id: 2,
      customerName: "Sarah Johnson",
      customerPhone: "+1-555-0124",
      membershipPlan: "vip",
      startTime: "2024-01-08T13:00:00Z",
      pausedTime: 30,
      totalAmount: 42.5,
      discount: 15,
    },
  },
  {
    id: 3,
    name: "Table 3",
    status: "available",
    location: "VIP Room",
    hourlyRate: 35,
  },
  {
    id: 4,
    name: "Table 4",
    status: "reserved",
    location: "Main Hall",
    hourlyRate: 25,
  },
  {
    id: 5,
    name: "Table 5",
    status: "available",
    location: "Main Hall",
    hourlyRate: 25,
  },
  {
    id: 6,
    name: "Table 6",
    status: "occupied",
    location: "VIP Room",
    hourlyRate: 35,
    currentSession: {
      id: 3,
      customerName: "Mike Wilson",
      customerPhone: "+1-555-0125",
      membershipPlan: "basic",
      startTime: "2024-01-08T15:00:00Z",
      totalAmount: 33.25,
      discount: 5,
    },
  },
]

const membershipPlans = {
  none: { name: "Walk-in", discount: 0, color: "bg-gray-100 text-gray-800" },
  basic: { name: "Basic", discount: 5, color: "bg-blue-100 text-blue-800" },
  premium: { name: "Premium", discount: 10, color: "bg-purple-100 text-purple-800" },
  vip: { name: "VIP", discount: 15, color: "bg-yellow-100 text-yellow-800" },
}

function getStatusColor(status: string) {
  switch (status) {
    case "occupied":
      return "bg-green-100 text-green-800 border-green-200"
    case "paused":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    case "available":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "reserved":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "occupied":
      return <Play className="h-4 w-4" />
    case "paused":
      return <Pause className="h-4 w-4" />
    case "available":
      return <Square className="h-4 w-4" />
    case "reserved":
      return <Clock className="h-4 w-4" />
    default:
      return <Square className="h-4 w-4" />
  }
}

function formatDuration(startTime: string, pausedTime?: number, currentTime: Date) {
  const start = new Date(startTime)
  const diffMs = currentTime.getTime() - start.getTime() - (pausedTime || 0) * 60000
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)
  return `${hours}h ${minutes}m ${seconds}s`
}

export function TablesOverview() {
  const [tables, setTables] = React.useState<Table[]>(mockTables)
  const [selectedTable, setSelectedTable] = React.useState<Table | null>(null)
  const [showCustomerDialog, setShowCustomerDialog] = React.useState(false)
  const [showSessionDialog, setShowSessionDialog] = React.useState(false)

  const [currentTime, setCurrentTime] = React.useState(new Date())

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleStartSession = (customer: Customer) => {
    if (!selectedTable) return

    const membershipPlan = membershipPlans[customer.membershipPlan as keyof typeof membershipPlans]
    const newSession = {
      id: Date.now(),
      customerName: customer.name,
      customerPhone: customer.phone,
      membershipPlan: customer.membershipPlan,
      startTime: new Date().toISOString(),
      totalAmount: 0,
      discount: membershipPlan.discount,
    }

    setTables((prev) =>
      prev.map((table) =>
        table.id === selectedTable.id ? { ...table, status: "occupied" as const, currentSession: newSession } : table,
      ),
    )

    setSelectedTable(null)
    setShowCustomerDialog(false)
  }

  const handlePauseSession = (tableId: number) => {
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "paused" as const } : table)))
  }

  const handleResumeSession = (tableId: number) => {
    setTables((prev) => prev.map((table) => (table.id === tableId ? { ...table, status: "occupied" as const } : table)))
  }

  const handleEndSession = (tableId: number) => {
    setTables((prev) =>
      prev.map((table) =>
        table.id === tableId ? { ...table, status: "available" as const, currentSession: undefined } : table,
      ),
    )
  }

  const activeTables = tables.filter((t) => t.status === "occupied").length
  const pausedTables = tables.filter((t) => t.status === "paused").length
  const availableTables = tables.filter((t) => t.status === "available").length
  const reservedTables = tables.filter((t) => t.status === "reserved").length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tables Overview</h2>
          <p className="text-muted-foreground">Monitor and manage all snooker tables</p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          Table Settings
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Tables</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{activeTables}</div>
            <p className="text-xs text-green-600">Currently playing</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Paused Tables</CardTitle>
            <Pause className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pausedTables}</div>
            <p className="text-xs text-yellow-600">Temporarily paused</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Available Tables</CardTitle>
            <Square className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{availableTables}</div>
            <p className="text-xs text-blue-600">Ready for use</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Reserved Tables</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{reservedTables}</div>
            <p className="text-xs text-purple-600">Booked in advance</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tables.map((table) => (
          <Card key={table.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{table.name}</CardTitle>
                <Badge className={getStatusColor(table.status)}>
                  {getStatusIcon(table.status)}
                  <span className="ml-1 capitalize">{table.status}</span>
                </Badge>
              </div>
              <CardDescription>
                {table.location} • ${table.hourlyRate}/hour
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {table.currentSession ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{table.currentSession.customerName}</span>
                    <Badge
                      className={
                        membershipPlans[table.currentSession.membershipPlan as keyof typeof membershipPlans].color
                      }
                    >
                      {membershipPlans[table.currentSession.membershipPlan as keyof typeof membershipPlans].name}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-lg font-mono font-bold text-green-600">
                      {formatDuration(table.currentSession.startTime, table.currentSession.pausedTime, currentTime)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      ${table.currentSession.totalAmount.toFixed(2)}
                      {table.currentSession.discount > 0 && (
                        <span className="text-green-600 ml-1">({table.currentSession.discount}% off)</span>
                      )}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex gap-2">
                    {table.status === "occupied" && (
                      <Button size="sm" variant="outline" onClick={() => handlePauseSession(table.id)}>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                    {table.status === "paused" && (
                      <Button size="sm" variant="outline" onClick={() => handleResumeSession(table.id)}>
                        <Play className="h-3 w-3 mr-1" />
                        Resume
                      </Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => handleEndSession(table.id)}>
                      <StopCircle className="h-3 w-3 mr-1" />
                      End
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {table.status === "available" ? "Ready for new session" : "Reserved for booking"}
                  </p>
                  {table.status === "available" && (
                    <Button
                      onClick={() => {
                        setSelectedTable(table)
                        setShowCustomerDialog(true)
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start Session
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Customer Creation Dialog */}
      <CustomerCreationDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onCustomerCreated={handleStartSession}
      />
    </div>
  )
}

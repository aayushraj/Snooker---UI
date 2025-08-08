"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, DollarSign, ShoppingCart, Play, Pause, Square, Calendar } from "lucide-react"

interface DashboardStatsProps {
  tables?: Array<{
    id: number
    name: string
    status: "available" | "occupied" | "paused" | "reserved"
    currentSession?: {
      customerName: string
      startTime: string
      totalAmount: number
    }
  }>
  orders?: Array<{
    id: number
    tableId: number
    customerName: string
    items: Array<{ name: string; quantity: number; price: number }>
    status: "pending" | "preparing" | "completed"
    total: number
    createdAt: string
  }>
}

export function DashboardStats({ tables = [], orders = [] }: DashboardStatsProps) {
  const activeTables = tables.filter((t) => t.status === "occupied").length
  const pausedTables = tables.filter((t) => t.status === "paused").length
  const availableTables = tables.filter((t) => t.status === "available").length
  const reservedTables = tables.filter((t) => t.status === "reserved").length

  const totalRevenue = tables.reduce((sum, table) => {
    return sum + (table.currentSession?.totalAmount || 0)
  }, 0)

  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.createdAt).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })

  const pendingOrders = todayOrders.filter((o) => o.status === "pending").length
  const completedOrders = todayOrders.filter((o) => o.status === "completed").length
  const totalOrderValue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to Elite Snooker Club Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Table Status Cards */}
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
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{reservedTables}</div>
            <p className="text-xs text-purple-600">Booked in advance</p>
          </CardContent>
        </Card>

        {/* Revenue Card */}
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-900">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-emerald-600">Today's table revenue</p>
          </CardContent>
        </Card>

        {/* Order Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending, {completedOrders} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOrderValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From food & beverages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTables + pausedTables}</div>
            <p className="text-xs text-muted-foreground">Currently in club</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

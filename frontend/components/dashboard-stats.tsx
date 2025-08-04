"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Users, Play, Pause, CheckCircle, XCircle } from "lucide-react"

interface DashboardStats {
  activeTables: number
  pausedTables: number
  availableTables: number
  reservedTables: number
  totalRevenue: number
  tableRevenue: number
  orderRevenue: number
  activeCustomers: number
  totalOrders: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/dashboard/stats`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: DashboardStats = await response.json()
        setStats(data)
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err)
        setError("Failed to load dashboard statistics.")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4">Loading dashboard...</div>
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>
  if (!stats) return <div className="text-center p-4">No data available.</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
          <Play className="h-4 w-4 text-snooker-green" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeTables}</div>
          <p className="text-xs text-muted-foreground">Currently in play</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Paused Tables</CardTitle>
          <Pause className="h-4 w-4 text-snooker-blue" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pausedTables}</div>
          <p className="text-xs text-muted-foreground">Sessions on hold</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Tables</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.availableTables}</div>
          <p className="text-xs text-muted-foreground">Ready for new sessions</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Reserved Tables</CardTitle>
          <XCircle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.reservedTables}</div>
          <p className="text-xs text-muted-foreground">Booked for later</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-snooker-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From tables and orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Table Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-snooker-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.tableRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From table usage</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-snooker-gold" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.orderRevenue.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">From food and beverages</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCustomers}</div>
          <p className="text-xs text-muted-foreground">Currently using tables</p>
        </CardContent>
      </Card>
    </div>
  )
}

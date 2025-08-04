"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { DollarSign, Users, Play, Pause, CheckCircle, XCircle } from "lucide-react"
import { useEffect, useState } from "react"

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

export default function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("https://localhost:5001/api/dashboard/stats")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: DashboardStats = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
        console.error("Failed to fetch dashboard stats:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="text-center py-8">Loading dashboard stats...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>
  if (!stats) return <div className="text-center py-8 text-gray-500">No stats available.</div>

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-6">
      <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-200">Active Tables</CardTitle>
          <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeTables}</div>
          <p className="text-xs text-green-600 dark:text-green-300">Currently in use</p>
        </CardContent>
      </Card>
      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-200">Paused Tables</CardTitle>
          <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pausedTables}</div>
          <p className="text-xs text-yellow-600 dark:text-yellow-300">Sessions on break</p>
        </CardContent>
      </Card>
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-200">Available Tables</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.availableTables}</div>
          <p className="text-xs text-blue-600 dark:text-blue-300">Ready for new customers</p>
        </CardContent>
      </Card>
      <Card className="bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-200">Reserved Tables</CardTitle>
          <XCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.reservedTables}</div>
          <p className="text-xs text-purple-600 dark:text-purple-300">Upcoming bookings</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Combined table & order revenue</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Table Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.tableRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">From table usage</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Order Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.orderRevenue.toFixed(2)}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">From food & beverages</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeCustomers}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Currently checked-in</p>
        </CardContent>
      </Card>
      <Card className="bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-200">Total Orders</CardTitle>
          <DollarSign className="h-4 w-4 text-gray-600 dark:text-gray-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</div>
          <p className="text-xs text-gray-600 dark:text-gray-300">Total orders placed</p>
        </CardContent>
      </Card>
    </div>
  )
}

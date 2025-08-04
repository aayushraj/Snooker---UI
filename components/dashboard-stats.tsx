"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Clock, DollarSign, Pause, Play, Table, TrendingUp, Users, Calendar } from "lucide-react"

interface TableStats {
  active: number
  paused: number
  available: number
  reserved: number
  totalRevenue: number
  avgSessionTime: number
  peakHours: string
}

export function DashboardStats() {
  // Simulate real-time data - in a real app, this would come from your state management
  const [stats, setStats] = React.useState<TableStats>({
    active: 6,
    paused: 2,
    available: 7,
    reserved: 1,
    totalRevenue: 2847.5,
    avgSessionTime: 85, // minutes
    peakHours: "7:00 PM - 10:00 PM",
  })

  // Update stats periodically to simulate real-time updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        active: Math.floor(Math.random() * 8) + 3,
        paused: Math.floor(Math.random() * 3),
        available: Math.floor(Math.random() * 6) + 4,
        reserved: Math.floor(Math.random() * 2),
        totalRevenue: prev.totalRevenue + Math.random() * 5,
      }))
    }, 10000) // Update every 10 seconds

    return () => clearInterval(interval)
  }, [])

  const totalTables = 16
  const occupancyRate = ((stats.active + stats.paused) / totalTables) * 100

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Tables */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Active Tables</CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{stats.active}</div>
            <p className="text-xs text-green-600">Currently playing</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                ${(stats.active * 12).toFixed(0)}/hr earning
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Paused Tables */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-800">Paused Tables</CardTitle>
            <Pause className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{stats.paused}</div>
            <p className="text-xs text-amber-600">Temporarily paused</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="border-amber-200 text-amber-800 bg-amber-50">
                Waiting to resume
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Tables */}
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Available Tables</CardTitle>
            <Table className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{stats.available}</div>
            <p className="text-xs text-emerald-600">Ready for booking</p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="border-emerald-200 text-emerald-800 bg-emerald-50">
                {((stats.available / totalTables) * 100).toFixed(0)}% free
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-lime-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600">+12.5% from yesterday</p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-xs text-green-600">Trending up</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Occupancy Overview */}
        <Card className="lg:col-span-2 border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Activity className="h-5 w-5 text-green-600" />
              Table Occupancy Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-700">Overall Occupancy</span>
                <span className="font-medium text-slate-800">{occupancyRate.toFixed(1)}%</span>
              </div>
              <Progress value={occupancyRate} className="h-2 bg-slate-200" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-slate-700">Active</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{stats.active} tables</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span className="text-sm text-slate-700">Paused</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{stats.paused} tables</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-700">Available</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{stats.available} tables</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">Reserved</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{stats.reserved} tables</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <Clock className="h-5 w-5 text-green-600" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Avg Session</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{stats.avgSessionTime} min</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Peak Hours</span>
                </div>
                <span className="text-sm font-medium text-slate-800">{stats.peakHours}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Hourly Rate</span>
                </div>
                <span className="text-sm font-medium text-slate-800">$12.00</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                  <span className="text-sm text-slate-700">Revenue/Table</span>
                </div>
                <span className="text-sm font-medium text-slate-800">
                  ${(stats.totalRevenue / totalTables).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalTables}</div>
                <p className="text-xs text-slate-600">Total Tables</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

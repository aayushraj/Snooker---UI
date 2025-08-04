"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, PauseCircle, CheckCircle, XCircle, DollarSign, Utensils, Users, ShoppingCart } from 'lucide-react'
import { useEffect, useState } from "react"
import { formatCurrency } from "@/lib/utils"

interface DashboardStatsData {
  activeTables: number;
  pausedTables: number;
  availableTables: number;
  reservedTables: number;
  totalRevenue: number;
  tableRevenue: number;
  orderRevenue: number;
  activeCustomers: number;
  totalOrders: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('https://localhost:5001/api/dashboard/stats');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DashboardStatsData = await response.json();
        setStats(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="text-center py-12">Loading dashboard stats...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="text-center py-12">No stats available.</div>;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-green-100 dark:bg-green-900/20 border-green-300 dark:border-green-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Active Tables</CardTitle>
          <Table className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.activeTables}</div>
          <p className="text-xs text-muted-foreground">Tables currently in use</p>
        </CardContent>
      </Card>
      <Card className="bg-yellow-100 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Paused Tables</CardTitle>
          <PauseCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{stats.pausedTables}</div>
          <p className="text-xs text-muted-foreground">Sessions on hold</p>
        </CardContent>
      </Card>
      <Card className="bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Available Tables</CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.availableTables}</div>
          <p className="text-xs text-muted-foreground">Ready for new customers</p>
        </CardContent>
      </Card>
      <Card className="bg-purple-100 dark:bg-purple-900/20 border-purple-300 dark:border-purple-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Reserved Tables</CardTitle>
          <XCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.reservedTables}</div>
          <p className="text-xs text-muted-foreground">Tables with upcoming bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">Combined table and order revenue</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Table Revenue</CardTitle>
          <Table className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.tableRevenue)}</div>
          <p className="text-xs text-muted-foreground">Revenue from table usage</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Order Revenue</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.orderRevenue)}</div>
          <p className="text-xs text-muted-foreground">Revenue from food and beverage orders</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeCustomers}</div>
          <p className="text-xs text-muted-foreground">Customers currently checked in</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <ShoppingCart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <p className="text-xs text-muted-foreground">Total food and beverage orders today</p>
        </CardContent>
      </Card>
    </div>
  )
}

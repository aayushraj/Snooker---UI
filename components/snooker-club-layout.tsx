"use client"

import { useState } from "react"
import { Home, LayoutGrid, Utensils, Receipt, Settings, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DashboardStats from "./dashboard-stats"
import TablesOverview from "./tables-overview"
import MenuManagement from "./menu-management"
import BillingSection from "./billing-section"
import TableManagement from "./table-management" // Assuming this is for adding/deleting tables

type ActiveTab = "dashboard" | "tables" | "menu" | "billing" | "settings" | "customers"

export default function SnookerClubLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardStats />
      case "tables":
        return <TablesOverview />
      case "menu":
        return <MenuManagement />
      case "billing":
        return <BillingSection />
      case "settings":
        \
        return <TableManagement />
        {
          /* Reusing TableManagement for settings/config */
        }
      case "customers":
        // You would create a CustomerManagement component here
        return <div className="p-6 text-center text-gray-500">Customer Management section coming soon!</div>
      default:
        return <DashboardStats />
    }
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen w-full">
        <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
          <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "dashboard" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("dashboard")}
                >
                  <Home className="h-5 w-5" />
                  <span className="sr-only">Dashboard</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Dashboard</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "tables" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("tables")}
                >
                  <LayoutGrid className="h-5 w-5" />
                  <span className="sr-only">Tables</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Tables Overview</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "menu" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("menu")}
                >
                  <Utensils className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Menu Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "billing" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("billing")}
                >
                  <Receipt className="h-5 w-5" />
                  <span className="sr-only">Billing</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Billing</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "customers" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("customers")}
                >
                  <Users className="h-5 w-5" />
                  <span className="sr-only">Customers</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Customer Management</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTab === "settings" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Table Settings</TooltipContent>
            </Tooltip>
          </nav>
        </aside>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 sm:ml-14">{renderContent()}</main>
      </div>
    </TooltipProvider>
  )
}

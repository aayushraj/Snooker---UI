"use client"

import { SidebarSeparator } from "@/components/ui/sidebar"

import * as React from "react"
import { Home, LayoutDashboard, Utensils, Users, DollarSign, ChevronDown, ChevronUp } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DashboardStats } from "./dashboard-stats"
import { TablesOverview } from "./tables-overview"
import { TableManagement } from "./table-management"
import { MenuManagement } from "./menu-management"
import { BillingSection } from "./billing-section"
import { CustomerCreationDialog } from "./customer-creation-dialog"

type Page = "dashboard" | "tables" | "customers" | "menu" | "billing" | "settings"

export function SnookerClubLayout() {
  const [activePage, setActivePage] = React.useState<Page>("dashboard")
  const { theme, setTheme } = useTheme()

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <DashboardStats />
            <div className="mt-8">
              <TablesOverview />
            </div>
          </>
        )
      case "tables":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Table Management</h1>
            <TableManagement />
          </>
        )
      case "customers":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Customer Management</h1>
            <CustomerCreationDialog
              onCustomerCreated={() => {
                /* Refresh customer list if needed */
              }}
            />
            {/* You might add a customer list component here */}
            <p className="mt-4 text-muted-foreground">Customer list coming soon...</p>
          </>
        )
      case "menu":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Menu Management</h1>
            <MenuManagement />
          </>
        )
      case "billing":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Billing & Reports</h1>
            <BillingSection />
          </>
        )
      case "settings":
        return (
          <>
            <h1 className="text-3xl font-bold mb-6">Settings</h1>
            <p className="text-muted-foreground">Application settings will be configured here.</p>
            <div className="mt-4">
              <h2 className="text-xl font-semibold mb-2">Theme</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Select Theme ({theme ? theme.charAt(0).toUpperCase() + theme.slice(1) : "System"})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
            <img src="/placeholder-logo.svg" alt="Snooker Club Logo" className="h-8 w-8" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Elite Snooker</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "dashboard"}
                    onClick={() => setActivePage("dashboard")}
                    tooltip="Dashboard"
                  >
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "tables"}
                    onClick={() => setActivePage("tables")}
                    tooltip="Table Management"
                  >
                    <Home />
                    <span>Table Management</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "customers"}
                    onClick={() => setActivePage("customers")}
                    tooltip="Customers"
                  >
                    <Users />
                    <span>Customers</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "menu"}
                    onClick={() => setActivePage("menu")}
                    tooltip="Menu"
                  >
                    <Utensils />
                    <span>Menu</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "billing"}
                    onClick={() => setActivePage("billing")}
                    tooltip="Billing"
                  >
                    <DollarSign />
                    <span>Billing</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <Collapsible defaultOpen className="group/collapsible">
            <SidebarGroup>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger>
                  Reports
                  <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 group-data-[collapsible=icon]:hidden" />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Daily Report">
                        <span>Daily Report</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton tooltip="Monthly Report">
                        <span>Monthly Report</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton tooltip="User Profile">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="/placeholder-user.jpg" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <span className="group-data-[collapsible=icon]:hidden">Admin User</span>
                    <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-(--radix-popper-anchor-width)">
                  <DropdownMenuItem onClick={() => setActivePage("settings")}>
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <h2 className="text-xl font-semibold">{activePage.charAt(0).toUpperCase() + activePage.slice(1)}</h2>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">{renderContent()}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

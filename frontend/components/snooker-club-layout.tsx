"use client"
import * as React from "react"
import { BarChart3, Calendar, CreditCard, Home, Settings, Table, Users, Bell, Search, ShoppingCart } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DashboardStats } from "@/components/dashboard-stats"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TablesOverview } from "@/components/tables-overview"
import { BillingSection } from "@/components/billing-section"
import { TableManagement } from "@/components/table-management"
import { MenuManagement } from "@/components/menu-management"

const navigationItems = [
  {
    title: "Dashboard",
    url: "#dashboard",
    icon: Home,
    isActive: true,
  },
  {
    title: "Tables",
    url: "#tables",
    icon: Table,
  },
  {
    title: "Orders",
    url: "#orders",
    icon: ShoppingCart,
  },
  {
    title: "Members",
    url: "#members",
    icon: Users,
  },
  {
    title: "Bookings",
    url: "#bookings",
    icon: Calendar,
  },
  {
    title: "Billing",
    url: "#billing",
    icon: CreditCard,
  },
  {
    title: "Analytics",
    url: "#analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    url: "#settings",
    icon: Settings,
  },
]

function AppSidebar({
  currentSection,
  setCurrentSection,
}: { currentSection: string; setCurrentSection: (section: string) => void }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#" className="flex items-center">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Table className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Elite Snooker Club</span>
                  <span className="text-xs">Management System</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    isActive={currentSection === item.url.replace("#", "")}
                    onClick={() => setCurrentSection(item.url.replace("#", ""))}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

function TopNavbar() {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex flex-1 items-center gap-2 px-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search tables, members..." className="pl-8" />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="ghost" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">John Doe</p>
                  <p className="text-xs leading-none text-muted-foreground">manager@elitesnooker.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

export function SnookerClubLayout() {
  const [currentSection, setCurrentSection] = React.useState("dashboard")

  return (
    <SidebarProvider>
      <AppSidebar currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <SidebarInset>
        <TopNavbar />
        <div className="flex flex-1 flex-col gap-6 p-4">
          {currentSection === "dashboard" && <DashboardStats />}
          {currentSection === "tables" && <TablesOverview />}
          {currentSection === "billing" && <BillingSection />}
          {currentSection === "orders" && <MenuManagement />}
          {currentSection === "members" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Members Management</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          )}
          {currentSection === "bookings" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Bookings Management</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          )}
          {currentSection === "analytics" && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Analytics Dashboard</h2>
              <p className="text-muted-foreground">Coming soon...</p>
            </div>
          )}
          {currentSection === "settings" && <TableManagement />}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

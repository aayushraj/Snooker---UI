"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, DollarSign, Clock, User, FileText, Download, Eye } from "lucide-react"

interface Bill {
  id: number
  tableId: number
  tableName: string
  customerName: string
  customerPhone: string
  membershipPlan: string
  sessionStart: string
  sessionEnd: string
  duration: number // in minutes
  tableRate: number
  tableAmount: number
  orders: Array<{
    id: number
    itemName: string
    quantity: number
    unitPrice: number
    total: number
  }>
  orderTotal: number
  discount: number
  discountAmount: number
  subtotal: number
  tax: number
  total: number
  status: "pending" | "paid" | "overdue"
  createdAt: string
}

const mockBills: Bill[] = [
  {
    id: 1001,
    tableId: 1,
    tableName: "Table 1",
    customerName: "John Smith",
    customerPhone: "+1-555-0123",
    membershipPlan: "premium",
    sessionStart: "2024-01-08T14:30:00Z",
    sessionEnd: "2024-01-08T16:45:00Z",
    duration: 135,
    tableRate: 25,
    tableAmount: 56.25,
    orders: [
      { id: 1, itemName: "Coffee", quantity: 2, unitPrice: 3.5, total: 7.0 },
      { id: 2, itemName: "Club Sandwich", quantity: 1, unitPrice: 8.5, total: 8.5 },
    ],
    orderTotal: 15.5,
    discount: 10,
    discountAmount: 7.18,
    subtotal: 64.57,
    tax: 6.46,
    total: 71.03,
    status: "paid",
    createdAt: "2024-01-08T16:45:00Z",
  },
  {
    id: 1002,
    tableId: 2,
    tableName: "Table 2",
    customerName: "Sarah Johnson",
    customerPhone: "+1-555-0124",
    membershipPlan: "vip",
    sessionStart: "2024-01-08T13:00:00Z",
    sessionEnd: "2024-01-08T15:30:00Z",
    duration: 150,
    tableRate: 25,
    tableAmount: 62.5,
    orders: [
      { id: 3, itemName: "Beer", quantity: 2, unitPrice: 4.5, total: 9.0 },
      { id: 4, itemName: "Fish & Chips", quantity: 1, unitPrice: 12.0, total: 12.0 },
    ],
    orderTotal: 21.0,
    discount: 15,
    discountAmount: 12.53,
    subtotal: 70.97,
    tax: 7.1,
    total: 78.07,
    status: "pending",
    createdAt: "2024-01-08T15:30:00Z",
  },
  {
    id: 1003,
    tableId: 6,
    tableName: "Table 6",
    customerName: "Mike Wilson",
    customerPhone: "+1-555-0125",
    membershipPlan: "basic",
    sessionStart: "2024-01-08T15:00:00Z",
    sessionEnd: "2024-01-08T16:00:00Z",
    duration: 60,
    tableRate: 35,
    tableAmount: 35.0,
    orders: [],
    orderTotal: 0,
    discount: 5,
    discountAmount: 1.75,
    subtotal: 33.25,
    tax: 3.33,
    total: 36.58,
    status: "overdue",
    createdAt: "2024-01-08T16:00:00Z",
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
    case "paid":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function BillingSection() {
  const [bills, setBills] = React.useState<Bill[]>(mockBills)
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null)
  const [activeTab, setActiveTab] = React.useState("all")

  const filteredBills = activeTab === "all" ? bills : bills.filter((bill) => bill.status === activeTab)

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.total, 0)
  const paidBills = bills.filter((bill) => bill.status === "paid").length
  const pendingBills = bills.filter((bill) => bill.status === "pending").length
  const overdueBills = bills.filter((bill) => bill.status === "overdue").length

  const handleMarkAsPaid = (billId: number) => {
    setBills(bills.map((bill) => (bill.id === billId ? { ...bill, status: "paid" as const } : bill)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Billing & Invoices</h2>
          <p className="text-muted-foreground">Manage customer bills and payments</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Paid Bills</CardTitle>
            <Receipt className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{paidBills}</div>
            <p className="text-xs text-green-600">Completed payments</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pending Bills</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{pendingBills}</div>
            <p className="text-xs text-yellow-600">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Overdue Bills</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{overdueBills}</div>
            <p className="text-xs text-red-600">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
          <CardDescription>View and manage customer billing information</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Bills</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Bill #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Table</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">#{bill.id}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{bill.customerName}</span>
                          <div className="flex items-center gap-1">
                            <Badge
                              className={membershipPlans[bill.membershipPlan as keyof typeof membershipPlans].color}
                            >
                              {membershipPlans[bill.membershipPlan as keyof typeof membershipPlans].name}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{bill.tableName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDuration(bill.duration)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${bill.total.toFixed(2)}</span>
                          {bill.discount > 0 && (
                            <span className="text-xs text-green-600">{bill.discount}% discount applied</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(bill.status)}>{bill.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedBill(bill)}>
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-3 w-3" />
                          </Button>
                          {bill.status === "pending" && (
                            <Button variant="outline" size="sm" onClick={() => handleMarkAsPaid(bill.id)}>
                              Mark Paid
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bill Detail Dialog */}
      <Dialog open={!!selectedBill} onOpenChange={() => setSelectedBill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bill Details - #{selectedBill?.id}</DialogTitle>
            <DialogDescription>Complete billing information for {selectedBill?.customerName}</DialogDescription>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              {/* Customer & Session Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold">Customer Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedBill.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedBill.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Membership:</span>
                      <Badge
                        className={membershipPlans[selectedBill.membershipPlan as keyof typeof membershipPlans].color}
                      >
                        {membershipPlans[selectedBill.membershipPlan as keyof typeof membershipPlans].name}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold">Session Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Table:</span>
                      <span>{selectedBill.tableName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{formatDuration(selectedBill.duration)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>${selectedBill.tableRate}/hour</span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Billing Breakdown */}
              <div className="space-y-4">
                <h4 className="font-semibold">Billing Breakdown</h4>

                {/* Table Charges */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Table Time ({formatDuration(selectedBill.duration)})</span>
                    <span>${selectedBill.tableAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Orders */}
                {selectedBill.orders.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Food & Beverages</h5>
                    {selectedBill.orders.map((order) => (
                      <div key={order.id} className="flex justify-between text-sm">
                        <span>
                          {order.itemName} × {order.quantity}
                        </span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${(selectedBill.tableAmount + selectedBill.orderTotal).toFixed(2)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({selectedBill.discount}%)</span>
                      <span>-${selectedBill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${selectedBill.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedBill.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedBill.status === "pending" && (
                  <Button onClick={() => handleMarkAsPaid(selectedBill.id)}>Mark as Paid</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

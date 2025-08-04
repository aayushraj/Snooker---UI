"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Receipt, DollarSign, Clock, User, FileText, Download, Eye } from 'lucide-react'
import { useState, useEffect } from "react"
import { formatCurrency, formatTime } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"

interface Bill {
  id: string;
  sessionId: string;
  tableId: string;
  tableName: string;
  customerId: string;
  customerName: string;
  membershipType: string;
  startTime: string;
  endTime: string;
  durationMilliseconds: number;
  hourlyRate: number;
  tableCharges: number;
  orderItems: {
    menuItemId: string;
    menuItemName: string;
    quantity: number;
    price: number;
    total: number;
  }[];
  orderCharges: number;
  subtotal: number;
  discountPercentage: number;
  discountAmount: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  status: string; // e.g., "Pending", "Paid"
}

const membershipPlans = {
  none: { name: "Walk-in", discount: 0, color: "bg-gray-100 text-gray-800" },
  basic: { name: "Basic", discount: 5, color: "bg-blue-100 text-blue-800" },
  premium: { name: "Premium", discount: 10, color: "bg-purple-100 text-purple-800" },
  vip: { name: "VIP", discount: 15, color: "bg-yellow-100 text-yellow-800" },
}

function getStatusColor(status: string) {
  switch (status) {
    case "Paid":
      return "bg-green-100 text-green-800"
    case "Pending":
      return "bg-yellow-100 text-yellow-800"
    case "Overdue":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function BillingSection() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [selectedBill, setSelectedBill] = React.useState<Bill | null>(null)
  const [activeTab, setActiveTab] = React.useState("all")

  const fetchBills = async () => {
    try {
      const response = await fetch('https://localhost:5001/api/bills');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Bill[] = await response.json();
      setBills(data);
    } catch (e: any) {
      setError(e.message);
      toast({
        title: "Error",
        description: `Failed to load bills: ${e.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
    const interval = setInterval(fetchBills, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredBills = activeTab === "all" ? bills : bills.filter((bill) => bill.status === activeTab)

  const totalRevenue = bills.reduce((sum, bill) => sum + bill.grandTotal, 0)
  const paidBills = bills.filter((bill) => bill.status === "Paid").length
  const pendingBills = bills.filter((bill) => bill.status === "Pending").length
  const overdueBills = bills.filter((bill) => bill.status === "Overdue").length

  const handleMarkAsPaid = (billId: string) => {
    setBills(bills.map((bill) => (bill.id === billId ? { ...bill, status: "Paid" } : bill)))
  }

  if (loading) return <div className="text-center py-12">Loading bills...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error: {error}</div>;
  if (bills.length === 0) return <div className="text-center py-12 text-muted-foreground">No bills generated yet.</div>;

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
              <TabsTrigger value="Pending">Pending</TabsTrigger>
              <TabsTrigger value="Paid">Paid</TabsTrigger>
              <TabsTrigger value="Overdue">Overdue</TabsTrigger>
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
                      <TableCell className="font-medium">{bill.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{bill.customerName}</span>
                          <div className="flex items-center gap-1">
                            <Badge
                              className={membershipPlans[bill.membershipType as keyof typeof membershipPlans].color}
                            >
                              {membershipPlans[bill.membershipType as keyof typeof membershipPlans].name}
                            </Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{bill.tableName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatTime(bill.durationMilliseconds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">${bill.grandTotal.toFixed(2)}</span>
                          {bill.discountPercentage > 0 && (
                            <span className="text-xs text-green-600">{bill.discountPercentage}% discount applied</span>
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
                          {bill.status === "Pending" && (
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
                      <span className="text-muted-foreground">Membership:</span>
                      <Badge
                        className={membershipPlans[selectedBill.membershipType as keyof typeof membershipPlans].color}
                      >
                        {membershipPlans[selectedBill.membershipType as keyof typeof membershipPlans].name}
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
                      <span>{formatTime(selectedBill.durationMilliseconds)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Rate:</span>
                      <span>${selectedBill.hourlyRate}/hour</span>
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
                    <span>Table Time ({formatTime(selectedBill.durationMilliseconds)})</span>
                    <span>${selectedBill.tableCharges.toFixed(2)}</span>
                  </div>
                </div>

                {/* Orders */}
                {selectedBill.orderItems.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm">Food & Beverages</h5>
                    {selectedBill.orderItems.map((order) => (
                      <div key={order.menuItemId} className="flex justify-between text-sm">
                        <span>
                          {order.menuItemName} × {order.quantity}
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
                    <span>${(selectedBill.tableCharges + selectedBill.orderCharges).toFixed(2)}</span>
                  </div>
                  {selectedBill.discountPercentage > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount ({selectedBill.discountPercentage}%)</span>
                      <span>-${selectedBill.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax</span>
                    <span>${selectedBill.taxAmount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${selectedBill.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                {selectedBill.status === "Pending" && (
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

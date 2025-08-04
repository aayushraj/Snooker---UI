"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { format } from "date-fns"

interface BillOrderItem {
  id: string
  menuItemId: string
  menuItemName: string
  quantity: number
  price: number
  total: number
}

interface Bill {
  id: string
  sessionId: string
  tableId: string
  tableName: string
  customerId: string
  customerName: string
  membershipType: string
  startTime: string
  endTime: string
  durationMilliseconds: number
  hourlyRate: number
  tableCharges: number
  orderItems: BillOrderItem[]
  orderCharges: number
  subtotal: number
  discountPercentage: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  grandTotal: number
  status: string
}

export default function BillingSection() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBills()
  }, [])

  const fetchBills = async () => {
    try {
      setLoading(true)
      const response = await fetch("https://localhost:5001/api/bills")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Bill[] = await response.json()
      setBills(data)
    } catch (err: any) {
      setError(err.message)
      console.error("Failed to fetch bills:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center py-8">Loading bills...</div>
  if (error) return <div className="text-center py-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Billing Overview</h1>
      {bills.length === 0 ? (
        <div className="text-center text-gray-500">No bills generated yet.</div>
      ) : (
        <div className="grid gap-6">
          {bills.map((bill) => (
            <Card key={bill.id} className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-semibold">Bill for Table {bill.tableName}</CardTitle>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${bill.status === "Paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {bill.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p>
                      <strong>Customer:</strong> {bill.customerName} ({bill.membershipType})
                    </p>
                    <p>
                      <strong>Session Start:</strong> {format(new Date(bill.startTime), "MMM dd, yyyy HH:mm")}
                    </p>
                    <p>
                      <strong>Session End:</strong> {format(new Date(bill.endTime), "MMM dd, yyyy HH:mm")}
                    </p>
                    <p>
                      <strong>Duration:</strong> {(bill.durationMilliseconds / 3600000).toFixed(2)} hours
                    </p>
                  </div>
                  <div>
                    <p>
                      <strong>Hourly Rate:</strong> ${bill.hourlyRate.toFixed(2)}
                    </p>
                    <p>
                      <strong>Table Charges:</strong> ${bill.tableCharges.toFixed(2)}
                    </p>
                    <p>
                      <strong>Order Charges:</strong> ${bill.orderCharges.toFixed(2)}
                    </p>
                  </div>
                </div>

                {bill.orderItems.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Order Details</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Item</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bill.orderItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.menuItemName}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.price.toFixed(2)}</TableCell>
                            <TableCell className="text-right">${item.total.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2 text-right">
                  <p>
                    <strong>Subtotal:</strong> ${bill.subtotal.toFixed(2)}
                  </p>
                  <p>
                    <strong>Discount ({bill.discountPercentage * 100}%):</strong> -${bill.discountAmount.toFixed(2)}
                  </p>
                  <p>
                    <strong>Tax ({bill.taxRate * 100}%):</strong> ${bill.taxAmount.toFixed(2)}
                  </p>
                  <p className="text-2xl font-bold">
                    <strong>Grand Total:</strong> ${bill.grandTotal.toFixed(2)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

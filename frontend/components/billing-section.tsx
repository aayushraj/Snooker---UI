"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { format } from "date-fns"

interface BillOrderItem {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function BillingSection() {
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBills = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/api/bills`) // Assuming a /api/bills endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setBills(data)
      } catch (err) {
        console.error("Failed to fetch bills:", err)
        setError("Failed to load billing data.")
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [])

  if (loading) return <div className="p-4 text-center">Loading bills...</div>
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>
  if (bills.length === 0) return <div className="p-4 text-center">No bills to display yet.</div>

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill ID</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Table Charges</TableHead>
              <TableHead>Order Charges</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Tax</TableHead>
              <TableHead>Grand Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-medium">{bill.id.substring(0, 8)}...</TableCell>
                <TableCell>{bill.tableName}</TableCell>
                <TableCell>
                  {bill.customerName} ({bill.membershipType})
                </TableCell>
                <TableCell>{format(new Date(bill.startTime), "MMM dd, HH:mm")}</TableCell>
                <TableCell>{format(new Date(bill.endTime), "MMM dd, HH:mm")}</TableCell>
                <TableCell>{(bill.durationMilliseconds / 3600000).toFixed(2)} hrs</TableCell>
                <TableCell>${bill.tableCharges.toFixed(2)}</TableCell>
                <TableCell>${bill.orderCharges.toFixed(2)}</TableCell>
                <TableCell>
                  -${bill.discountAmount.toFixed(2)} ({bill.discountPercentage * 100}%)
                </TableCell>
                <TableCell>
                  ${bill.taxAmount.toFixed(2)} ({bill.taxRate * 100}%)
                </TableCell>
                <TableCell className="font-semibold">${bill.grandTotal.toFixed(2)}</TableCell>
                <TableCell>{bill.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

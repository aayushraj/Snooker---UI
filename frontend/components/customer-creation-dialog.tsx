"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { PlusCircle } from 'lucide-react'

interface Customer {
  id: string
  name: string
  contactInfo: string
  membershipType: string
  discountPercentage: number
}

interface CustomerCreationDialogProps {
  onCustomerCreated: (customer: Customer) => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function CustomerCreationDialog({ onCustomerCreated }: CustomerCreationDialogProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [contactInfo, setContactInfo] = useState("")
  const [membershipType, setMembershipType] = useState("Standard")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!customerName.trim() || !contactInfo.trim()) {
      toast.error("Name and Contact Info are required.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: customerName,
          contactInfo: contactInfo,
          membershipType: membershipType,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.title || `HTTP error! status: ${response.status}`)
      }

      const newCustomer: Customer = await response.json()
      toast.success(`Customer ${newCustomer.name} created successfully!`)
      onCustomerCreated(newCustomer)
      setDialogOpen(false)
      setCustomerName("")
      setContactInfo("")
      setMembershipType("Standard")
    } catch (error: any) {
      console.error("Failed to create customer:", error)
      toast.error(`Failed to create customer: ${error.message || "Unknown error"}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Customer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new customer to your club.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactInfo" className="text-right">
              Contact Info
            </Label>
            <Input
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="membershipType" className="text-right">
              Membership
            </Label>
            <Select
              onValueChange={setMembershipType}
              value={membershipType}
              disabled={isSubmitting}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select membership type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Premium">Premium (10% Discount)</SelectItem>
                <SelectItem value="VIP">VIP (20% Discount)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !customerName.trim() || !contactInfo.trim()}>
            {isSubmitting ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

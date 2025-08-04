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

interface CustomerCreationDialogProps {
  onCustomerCreated: () => void
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001"

export function CustomerCreationDialog({ onCustomerCreated }: CustomerCreationDialogProps) {
  const [customerName, setCustomerName] = useState("")
  const [membershipType, setMembershipType] = useState("None")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      toast.error("Customer name cannot be empty.")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: customerName, membershipType }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newCustomer = await response.json()
      toast.success(`Customer "${newCustomer.name}" created successfully!`)
      setCustomerName("")
      setMembershipType("None")
      setIsOpen(false)
      onCustomerCreated() // Notify parent component
    } catch (error) {
      console.error("Failed to create customer:", error)
      toast.error("Failed to create customer. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Customer</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>Enter the customer's name and select their membership type.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              Name
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="col-span-3"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="membershipType" className="text-right">
              Membership
            </Label>
            <Select value={membershipType} onValueChange={setMembershipType} disabled={isLoading}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">None</SelectItem>
                <SelectItem value="Basic">Basic</SelectItem>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="VIP">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="outline" disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateCustomer} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

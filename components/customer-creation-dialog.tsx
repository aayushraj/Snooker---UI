"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface CustomerCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  onCustomerCreated: (customer: any) => void
}

export default function CustomerCreationDialog({ isOpen, onClose, onCustomerCreated }: CustomerCreationDialogProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [membershipType, setMembershipType] = useState("None")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await fetch("https://localhost:5001/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, phone, email, membershipType, notes }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newCustomer = await response.json()
      onCustomerCreated(newCustomer)
      toast({
        title: "Customer Created!",
        description: `${newCustomer.name} has been added.`,
        variant: "default",
      })
      handleClose()
    } catch (error: any) {
      toast({
        title: "Error creating customer",
        description: error.message,
        variant: "destructive",
      })
      console.error("Error creating customer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName("")
    setPhone("")
    setEmail("")
    setMembershipType("None")
    setNotes("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>Fill in the details to create a new customer profile.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="col-span-3"
              type="tel"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              type="email"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="membership" className="text-right">
              Membership
            </Label>
            <Select value={membershipType} onValueChange={setMembershipType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a membership plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Walk-in (0% Discount)</SelectItem>
                <SelectItem value="Basic">Basic (5% Discount)</SelectItem>
                <SelectItem value="Premium">Premium (10% Discount)</SelectItem>
                <SelectItem value="VIP">VIP (15% Discount)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !name}>
            {loading ? "Creating..." : "Create Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

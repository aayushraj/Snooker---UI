"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Crown, Star, User, Zap } from "lucide-react"

interface CustomerCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCustomerCreated: (customer: {
    name: string
    phone: string
    email: string
    membershipPlan: string
  }) => void
}

const membershipPlans = [
  {
    id: "none",
    name: "Walk-in Customer",
    description: "No membership benefits",
    discount: 0,
    icon: User,
    color: "bg-gray-100 text-gray-800 border-gray-200",
  },
  {
    id: "basic",
    name: "Basic Member",
    description: "5% discount on all services",
    discount: 5,
    icon: Star,
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    id: "premium",
    name: "Premium Member",
    description: "10% discount + priority booking",
    discount: 10,
    icon: Zap,
    color: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    id: "vip",
    name: "VIP Member",
    description: "15% discount + exclusive benefits",
    discount: 15,
    icon: Crown,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
]

export function CustomerCreationDialog({ open, onOpenChange, onCustomerCreated }: CustomerCreationDialogProps) {
  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    email: "",
    membershipPlan: "none",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onCustomerCreated(formData)
      setFormData({ name: "", phone: "", email: "", membershipPlan: "none" })
      onOpenChange(false)
    }
  }

  const selectedPlan = membershipPlans.find((plan) => plan.id === formData.membershipPlan)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Customer</DialogTitle>
          <DialogDescription>
            Enter customer details to start a new session. You can edit the profile later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
            />
          </div>

          <div className="space-y-3">
            <Label>Membership Plan</Label>
            <div className="grid grid-cols-2 gap-3">
              {membershipPlans.map((plan) => {
                const Icon = plan.icon
                return (
                  <Card
                    key={plan.id}
                    className={`cursor-pointer transition-all ${
                      formData.membershipPlan === plan.id
                        ? "ring-2 ring-primary border-primary"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => setFormData({ ...formData, membershipPlan: plan.id })}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <CardTitle className="text-sm">{plan.name}</CardTitle>
                        </div>
                        {plan.discount > 0 && (
                          <Badge variant="secondary" className={plan.color}>
                            {plan.discount}% OFF
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="text-xs">{plan.description}</CardDescription>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {selectedPlan && selectedPlan.discount > 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <selectedPlan.icon className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">{selectedPlan.name} Selected</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Customer will receive {selectedPlan.discount}% discount on all services
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.name.trim()}>
              Create Customer & Start Session
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

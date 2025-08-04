"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"

interface CustomerCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (customerId: string) => void;
}

interface Customer {
  id: string;
  name: string;
  membershipType: string;
  discountPercentage: number;
}

const membershipPlans = [
  { type: "None", discount: 0 },
  { type: "Basic", discount: 5 },
  { type: "Premium", discount: 10 },
  { type: "VIP", discount: 15 },
];

export function CustomerCreationDialog({ isOpen, onClose, onCustomerCreated }: CustomerCreationDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [membershipType, setMembershipType] = useState("None");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [selectedExistingCustomer, setSelectedExistingCustomer] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('https://localhost:5001/api/customers');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Customer[] = await response.json();
        setExistingCustomers(data);
      } catch (error) {
        console.error("Failed to fetch customers:", error);
        toast({
          title: "Error",
          description: "Failed to load existing customers.",
          variant: "destructive",
        });
      }
    };
    if (isOpen) {
      fetchCustomers();
      setCustomerName("");
      setMembershipType("None");
      setSelectedExistingCustomer(null);
    }
  }, [isOpen, toast]);

  useEffect(() => {
    const selectedPlan = membershipPlans.find(plan => plan.type === membershipType);
    setDiscountPercentage(selectedPlan ? selectedPlan.discount : 0);
  }, [membershipType]);

  const handleCreateCustomer = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Validation Error",
        description: "Customer name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('https://localhost:5001/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: customerName, membershipType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const newCustomer: Customer = await response.json();
      toast({
        title: "Success",
        description: `Customer "${newCustomer.name}" created with ${newCustomer.membershipType} membership.`,
      });
      onCustomerCreated(newCustomer.id);
      onClose();
    } catch (error) {
      console.error("Failed to create customer:", error);
      toast({
        title: "Error",
        description: "Failed to create customer.",
        variant: "destructive",
      });
    }
  };

  const handleSelectExistingCustomer = () => {
    if (selectedExistingCustomer) {
      onCustomerCreated(selectedExistingCustomer);
      onClose();
    } else {
      toast({
        title: "Validation Error",
        description: "Please select an existing customer.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create or Select Customer</DialogTitle>
          <DialogDescription>
            Enter new customer details or select an existing one to start a session.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="customerName" className="text-right">
              New Customer Name
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => {
                setCustomerName(e.target.value);
                setSelectedExistingCustomer(null); // Deselect existing when typing new
              }}
              className="col-span-3"
              placeholder="John Doe"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="membership" className="text-right">
              Membership
            </Label>
            <Select value={membershipType} onValueChange={setMembershipType}>
              <SelectTrigger id="membership" className="col-span-3">
                <SelectValue placeholder="Select membership" />
              </SelectTrigger>
              <SelectContent>
                {membershipPlans.map((plan) => (
                  <SelectItem key={plan.type} value={plan.type}>
                    {plan.type} ({plan.discount}% Discount)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Discount</Label>
            <div className="col-span-3 text-lg font-semibold text-green-600">
              {discountPercentage}%
            </div>
          </div>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="existingCustomer" className="text-right">
              Existing Customer
            </Label>
            <Select
              value={selectedExistingCustomer || ""}
              onValueChange={(value) => {
                setSelectedExistingCustomer(value);
                setCustomerName(""); // Clear new customer name when selecting existing
              }}
            >
              <SelectTrigger id="existingCustomer" className="col-span-3">
                <SelectValue placeholder="Select existing customer" />
              </SelectTrigger>
              <SelectContent>
                {existingCustomers.length === 0 && (
                  <SelectItem value="no-customers" disabled>
                    No existing customers
                  </SelectItem>
                )}
                {existingCustomers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name} ({customer.membershipType})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedExistingCustomer ? (
            <Button onClick={handleSelectExistingCustomer}>Select Customer</Button>
          ) : (
            <Button onClick={handleCreateCustomer}>Create Customer</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

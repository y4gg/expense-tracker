"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

interface RecurringFormData {
  amount: number;
  description: string;
  date: Date;
  categoryId: string | undefined;
  type: "expense" | "income";
  frequency: "daily" | "every3days" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly";
  nextDueDate: Date;
}

interface AddRecurringDialogProps {
  children: React.ReactNode;
}

const frequencyOptions = [
  { value: "daily" as const, label: "Daily", days: 1 },
  { value: "every3days" as const, label: "Every 3 days", days: 3 },
  { value: "weekly" as const, label: "Weekly", days: 7 },
  { value: "biweekly" as const, label: "Bi-weekly", days: 14 },
  { value: "monthly" as const, label: "Monthly", days: 30 },
  { value: "quarterly" as const, label: "Quarterly", days: 90 },
  { value: "yearly" as const, label: "Yearly", days: 365 },
];

export function AddRecurringDialog({ children }: AddRecurringDialogProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [frequency, setFrequency] = useState<"daily" | "every3days" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly">("monthly");
  const [nextDueDate, setNextDueDate] = useState("");
  const utils = trpc.useUtils();

  const { data: categories = [] } = trpc.categories.getAll.useQuery();

  const createMutation = trpc.recurring.create.useMutation({
    onSuccess: () => {
      toast.success("Recurring transaction created successfully");
      utils.recurring.invalidate();
      utils.expenses.invalidate();
      utils.categories.invalidate();
      setOpen(false);
      setAmount("");
      setDescription("");
      setDate("");
      setCategoryId(undefined);
      setType("expense");
      setFrequency("monthly");
      setNextDueDate("");
    },
    onError: () => {
      toast.error("Failed to save recurring transaction");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };

      const nextDueDateValue = nextDueDate ? new Date(nextDueDate) : (() => {
        const today = new Date();
        switch (frequency) {
          case "daily":
            return addDays(today,1);
          case "every3days":
            return addDays(today, 3);
          case "weekly":
            return addDays(today, 7);
          case "biweekly":
            return addDays(today, 14);
          case "monthly":
            return new Date(today.getFullYear(), today.getMonth() + 1, 1);
          case "quarterly":
            return new Date(today.getFullYear(), today.getMonth() + 3, 1);
          case "yearly":
            return new Date(today.getFullYear(), today.getMonth() + 12, 1);
        }
      })();

      const data: RecurringFormData = {
        amount: parseFloat(amount),
        description,
        date: new Date(),
        categoryId,
        type,
        frequency,
        nextDueDate: nextDueDateValue,
      };

      createMutation.mutate(data);
    } catch {
      toast.error("Failed to save recurring transaction");
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent>
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Add Recurring Transaction</SheetTitle>
            <SheetDescription>
              Create a new recurring transaction
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("expense")}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("income")}
                >
                  Income
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Rent, Netflix subscription, etc."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <div className="grid grid-cols-2 gap-2">
                {frequencyOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={frequency === opt.value ? "default" : "outline"}
                    onClick={() => setFrequency(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Next Due Date</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                required
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Create"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

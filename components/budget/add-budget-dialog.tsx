"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

interface BudgetFormData {
  categoryId: string;
  amount: number;
}

interface AddBudgetDialogProps {
  budget?: {
    id: string;
    categoryId: string;
    amount: number;
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddBudgetDialog({ budget, children, open: controlledOpen, onOpenChange }: AddBudgetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const [categoryId, setCategoryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const utils = trpc.useUtils();

  useEffect(() => {
    if (budget) {
      setTimeout(() => {
        setCategoryId(budget.categoryId);
        setAmount(budget.amount.toString());
      }, 0);
    } else if (!controlledOpen) {
      setTimeout(() => {
        setCategoryId("");
        setAmount("");
      }, 0);
    }
  }, [budget, controlledOpen]);

  const categoriesQuery = trpc.categories.getAll.useQuery();

  const createMutation = trpc.budgets.create.useMutation({
    onSuccess: () => {
      toast.success("Budget created successfully");
      utils.budgets.invalidate();
      utils.categories.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to create budget");
    },
  });

  const updateMutation = trpc.budgets.update.useMutation({
    onSuccess: () => {
      toast.success("Budget updated successfully");
      utils.budgets.invalidate();
      utils.categories.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to update budget");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: BudgetFormData = {
      categoryId,
      amount: parseFloat(amount),
    };

    if (budget) {
      updateMutation.mutate({ id: budget.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{budget ? "Edit Budget" : "Add Budget"}</DialogTitle>
            <DialogDescription>
              {budget ? "Update your budget limit" : "Set a spending limit for a category"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data?.map((cat) => (
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
              <Label htmlFor="amount">Budget Amount</Label>
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : budget ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState } from "react";
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
} from "@/components/ui/dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";

interface FundGoalDialogProps {
  goalId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FundGoalDialog({ goalId, open, onOpenChange }: FundGoalDialogProps) {
  const [amount, setAmount] = useState("");
  const utils = trpc.useUtils();

  const addFundsMutation = trpc.goals.addFunds.useMutation({
    onSuccess: () => {
      toast.success("Funds added successfully");
      utils.goals.invalidate();
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to add funds");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    addFundsMutation.mutate({
      id: goalId,
      amount: parseFloat(amount),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Funds to Goal</DialogTitle>
            <DialogDescription>
              Add money to your savings goal to track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Add</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={addFundsMutation.isPending}>
              {addFundsMutation.isPending ? "Adding..." : "Add Funds"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

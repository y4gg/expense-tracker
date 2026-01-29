"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Edit2, Pause, Play, Trash2, Plus } from "lucide-react";
import { AddRecurringDialog } from "@/components/recurring/add-recurring-dialog";

export function RecurringList() {
  const utils = trpc.useUtils();

  const { data: recurring = [], isLoading } = trpc.recurring.getAll.useQuery();

  const deleteMutation = trpc.recurring.delete.useMutation({
    onSuccess: () => {
      toast.success("Recurring transaction deleted successfully");
      utils.recurring.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete recurring transaction");
    },
  });

  const toggleActiveMutation = trpc.recurring.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Recurring transaction updated successfully");
      utils.recurring.invalidate();
    },
  });

  const createExpenseMutation = trpc.recurring.createExpense.useMutation({
    onSuccess: () => {
      toast.success("Expense created from recurring transaction");
      utils.expenses.invalidate();
      utils.recurring.invalidate();
    },
    onError: () => {
      toast.error("Failed to create expense");
    },
  });

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Recurring Transactions</CardTitle>
            <CardDescription className="text-base">Manage your recurring transactions</CardDescription>
          </div>
          <AddRecurringDialog>
            <Button variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Add Recurring Transaction
            </Button>
          </AddRecurringDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex min-h-32 items-center justify-center text-muted-foreground">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : recurring.length === 0 ? (
          <div className="flex min-h-32 items-center justify-center text-center text-muted-foreground">
            <p className="text-base">No recurring transactions yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recurring.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg bg-card">
                <div className="flex-1">
                  <p className="font-semibold">{item.description}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.type === "income" ? "+" : "-"}${parseFloat(item.amount).toFixed(2)}
                  </p>
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground">
                      {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)} · Due {new Date(item.nextDueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => createExpenseMutation.mutate({ recurringTransactionId: item.id })}
                    disabled={createExpenseMutation.isPending}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={toggleActiveMutation.isPending}
                    onClick={() => toggleActiveMutation.mutate({ id: item.id })}
                  >
                    {item.isActive ? <Pause className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate({ id: item.id })}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

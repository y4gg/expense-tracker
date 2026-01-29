"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AddBudgetDialog } from "@/components/budget/add-budget-dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export function BudgetList() {
  const [editBudget, setEditBudget] = useState<{ id: string; categoryId: string; amount: number } | undefined>();

  const { data: budgets, isLoading } = trpc.budgets.getWithActuals.useQuery();

  const deleteMutation = trpc.budgets.delete.useMutation({
    onSuccess: () => {
      toast.success("Budget deleted successfully");
      utils.budgets.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete budget");
    },
  });

  const utils = trpc.useUtils();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this budget?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle>Budgets</CardTitle>
          <CardDescription>Loading budgets...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budgets</CardTitle>
            <CardDescription>
              Category budgets with current month&apos;s spending
            </CardDescription>
          </div>
          <AddBudgetDialog>
            <Button variant="outline">Add Budget</Button>
          </AddBudgetDialog>
        </div>
      </CardHeader>
      <CardContent>
        {!budgets || budgets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No budgets set. Click &quot;Add Budget&quot; to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: budget.category?.color || "#94a3b8" }}
                    />
                    <span className="font-medium">{budget.category?.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(budget.actual)} / {formatCurrency(budget.amount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditBudget({
                        id: budget.id,
                        categoryId: budget.categoryId || "",
                        amount: budget.amount,
                      })}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Progress value={Math.min(budget.percentage, 100)} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{budget.percentage.toFixed(1)}% used</span>
                  <span className={budget.remaining < 0 ? "text-destructive" : ""}>
                    {budget.remaining < 0 ? "Over budget" : `${formatCurrency(budget.remaining)} remaining`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {editBudget && (
        <AddBudgetDialog
          budget={editBudget}
          open={!!editBudget}
          onOpenChange={(open) => !open && setEditBudget(undefined)}
        />
      )}
    </Card>
  );
}

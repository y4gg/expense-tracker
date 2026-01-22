"use client";

import { ExpenseList } from "@/components/expenses/expense-list";
import { AddExpenseDialog } from "@/components/expenses/add-expense-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function TransactionsPage() {
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Transactions</h1>
          <p className="mt-2 text-lg text-muted-foreground">View and manage your transactions</p>
        </div>
        <AddExpenseDialog>
          <Button size="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </AddExpenseDialog>
      </div>

      <ExpenseList />
    </>
  );
}

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddExpenseDialog } from "./add-expense-dialog";
import { deleteExpense } from "@/actions/expenses";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface Expense {
  id: string;
  amount: string;
  description: string;
  date: Date;
  categoryId: string | null;
  type: "expense" | "income";
  category: Category | null;
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
}

type FilterType = "all" | "expense" | "income";

export function ExpenseList({ expenses, categories }: ExpenseListProps) {
  const [filter, setFilter] = React.useState<FilterType>("all");

  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success("Transaction deleted successfully");
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "all") return true;
    return expense.type === filter;
  });

  const getEmptyMessage = () => {
    if (filter === "all") return "No transactions yet. Add your first transaction!";
    if (filter === "expense") return "No expenses yet. Add your first expense!";
    return "No income yet. Add your first income!";
  };

  const getTitle = () => {
    if (filter === "all") return "Transactions";
    if (filter === "expense") return "Expenses";
    return "Income";
  };

  const getDescription = () => {
    if (filter === "all") return "Your transaction history";
    if (filter === "expense") return "Your expense history";
    return "Your income history";
  };

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-xl">{getTitle()}</CardTitle>
            <CardDescription className="text-base">{getDescription()}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border bg-card p-1">
              <Button
                variant={filter === "all" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("all")}
                className="h-8"
              >
                All
              </Button>
              <Button
                variant={filter === "expense" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("expense")}
                className="h-8"
              >
                Expenses
              </Button>
              <Button
                variant={filter === "income" ? "default" : "ghost"}
                size="sm"
                onClick={() => setFilter("income")}
                className="h-8"
              >
                Income
              </Button>
            </div>
            <AddExpenseDialog categories={categories}>
              <Button size="default">Add</Button>
            </AddExpenseDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[160px]">Category</TableHead>
              <TableHead className="w-[120px] text-right">Amount</TableHead>
              <TableHead className="w-[60px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                    <p className="text-base">{getEmptyMessage()}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Badge
                        style={{ backgroundColor: expense.category.color }}
                        className="rounded-md px-2.5 py-1 text-sm font-medium text-white"
                      >
                        {expense.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-md px-2.5 py-1 text-sm">
                        Uncategorized
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${expense.type === "income" ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
                    {expense.type === "income" ? "+" : "-"}${parseFloat(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(expense.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

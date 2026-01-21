"use client";

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
  category: Category | null;
}

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
}

export function ExpenseList({ expenses, categories }: ExpenseListProps) {
  const handleDelete = async (id: string) => {
    try {
      await deleteExpense(id);
      toast.success("Expense deleted successfully");
    } catch {
      toast.error("Failed to delete expense");
    }
  };

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Expenses</CardTitle>
            <CardDescription className="text-base">Your expense history</CardDescription>
          </div>
          <AddExpenseDialog categories={categories}>
            <Button size="default">Add Expense</Button>
          </AddExpenseDialog>
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
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                    <p className="text-base">No expenses yet. Add your first expense!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
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
                  <TableCell className="text-right font-semibold">
                    ${parseFloat(expense.amount).toFixed(2)}
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

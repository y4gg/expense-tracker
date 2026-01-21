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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>Your expense history</CardDescription>
          </div>
          <AddExpenseDialog categories={categories}>
            <Button>Add Expense</Button>
          </AddExpenseDialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No expenses yet. Add your first expense!
                </TableCell>
              </TableRow>
            ) : (
              expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Badge style={{ backgroundColor: expense.category.color }}>
                        {expense.category.name}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Uncategorized</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    ${parseFloat(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
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

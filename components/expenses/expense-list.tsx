import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddExpenseDialog } from "./add-expense-dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Trash2, RotateCw, FileImage, Pencil } from "lucide-react";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";

type FilterType = "all" | "expense" | "income";

export function ExpenseList() {
  const [filter, setFilter] = useState<FilterType>("all");
  const utils = trpc.useUtils();

  const { data: expenses = [], isLoading } = trpc.expenses.getAll.useQuery();
  const [previewExpense, setPreviewExpense] = useState<{
    id: string;
  } | null>(null);
  const [editingExpense, setEditingExpense] = useState<{
    id: string;
    amount: string;
    description: string;
    date: Date;
    categoryId?: string | null;
    type?: "expense" | "income";
    receiptFile?: string | null;
    receiptFileName?: string | null;
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      utils.expenses.invalidate();
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    },
  });

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
    <>
      <Card className="rounded-xl shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{getTitle()}</CardTitle>
              <CardDescription className="text-base">{getDescription()}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={filter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFilter("all")}>All</Button>
              <Button variant={filter === "expense" ? "default" : "ghost"} size="sm" onClick={() => setFilter("expense")}>Expenses</Button>
              <Button variant={filter === "income" ? "default" : "ghost"} size="sm" onClick={() => setFilter("income")}>Income</Button>
              <AddExpenseDialog>
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
                <TableHead className="w-[40px]" />
                <TableHead className="w-[60px]" />
                <TableHead className="w-[50px]" />
                <TableHead className="w-[50px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
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
                      {expense.recurringTransactionId && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => window.location.href = `/dashboard/settings`}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {expense.receiptFile && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                          onClick={() => setPreviewExpense({ id: expense.id })}
                        >
                          <FileImage className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        onClick={() => setEditingExpense({
                          id: expense.id,
                          amount: expense.amount,
                          description: expense.description,
                          date: new Date(expense.date),
                          categoryId: expense.categoryId,
                          type: expense.type,
                          receiptFile: expense.receiptFile,
                          receiptFileName: expense.receiptFileName,
                        })}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          setExpenseToDelete(expense.id);
                          setDeleteConfirmOpen(true);
                        }}
                        disabled={deleteMutation.isPending}
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
      {editingExpense && (
        <AddExpenseDialog
          expense={editingExpense}
          open={true}
          onOpenChange={(open) => {
            if (!open) setEditingExpense(null);
          }}
        />
      )}
      {previewExpense && (
        <ReceiptPreviewDialog
          expenseId={previewExpense.id}
          receiptFile={expenses.find((e) => e.id === previewExpense.id)?.receiptFile ?? null}
          receiptFileName={expenses.find((e) => e.id === previewExpense.id)?.receiptFileName ?? null}
          open={previewExpense !== null}
          onClose={() => setPreviewExpense(null)}
          onDelete={async () => {
            if (previewExpense?.id) {
              await deleteMutation.mutate({ id: previewExpense.id });
              setPreviewExpense(null);
            }
          }}
        />
      )}
      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setExpenseToDelete(null);
        }}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteMutation.mutate({ id: expenseToDelete });
          }
        }}
        itemName={expenses.find((e) => e.id === expenseToDelete)?.description ?? "this transaction"}
      />
    </>
  );
}

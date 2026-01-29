import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddExpenseDialog } from "./add-expense-dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";
import { DeleteConfirmDialog } from "./delete-confirm-dialog";
import { TransactionActionMenu } from "./transaction-action-menu";
import { ReceiptUpload } from "./receipt-upload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BulkActionBar } from "./bulk-action-bar";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { BulkCategoryDialog } from "./bulk-category-dialog";

type FilterType = "all" | "expense" | "income";

export function ExpenseList() {
  const [filter, setFilter] = useState<FilterType>("all");
  const utils = trpc.useUtils();

  const { data: expenses = [], isLoading } = trpc.expenses.getAll.useQuery();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
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
  } | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [contextMenuExpenseId, setContextMenuExpenseId] = useState<string | null>(null);
  const [uploadingExpenseId, setUploadingExpenseId] = useState<string | null>(null);
  const deleteMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Transaction deleted successfully");
      utils.expenses.invalidate();
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    },
  });

  const bulkDeleteMutation = trpc.expenses.bulkDelete.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transaction${data.count !== 1 ? "s" : ""} deleted successfully`);
      utils.expenses.invalidate();
      setSelectedIds(new Set());
      setBulkDeleteOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete transactions");
    },
  });

  const bulkUpdateMutation = trpc.expenses.bulkUpdate.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} transaction${data.count !== 1 ? "s" : ""} updated successfully`);
      utils.expenses.invalidate();
      setSelectedIds(new Set());
      setBulkCategoryOpen(false);
    },
    onError: () => {
      toast.error("Failed to update transactions");
    },
  });

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === "all") return true;
    return expense.type === filter;
  });

  const filteredSelectedIds = Array.from(selectedIds).filter((id) =>
    filteredExpenses.some((e) => e.id === id)
  );

  const allSelected = filteredExpenses.length > 0 && filteredSelectedIds.length === filteredExpenses.length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = () => {
    bulkDeleteMutation.mutate({ ids: filteredSelectedIds });
  };

  const handleBulkCategoryChange = (categoryId: string | null) => {
    bulkUpdateMutation.mutate({ ids: filteredSelectedIds, categoryId: categoryId ?? undefined });
  };

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

  const hasReceiptsInSelection = filteredSelectedIds.some((id) =>
    expenses.find((e) => e.id === id)?.receiptFile
  );

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
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {filteredSelectedIds.length > 0 && (
            <div className="mb-4">
              <BulkActionBar
                count={filteredSelectedIds.length}
                onClearSelection={() => setSelectedIds(new Set())}
                onChangeCategory={() => setBulkCategoryOpen(true)}
                onDelete={() => setBulkDeleteOpen(true)}
              />
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] px-2">
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead className="min-w-[120px]">Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="min-w-[140px]">Category</TableHead>
                <TableHead className="min-w-[100px] text-right">Amount</TableHead>
                <TableHead className="min-w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex min-h-40 items-center justify-center text-muted-foreground">
                      <p className="text-base">{getEmptyMessage()}</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => {
                  const expenseData = {
                    id: expense.id,
                    amount: expense.amount,
                    description: expense.description,
                    date: new Date(expense.date),
                    categoryId: expense.categoryId,
                    type: expense.type,
                  };

                  return (
                    <>
                      <TableRow
                        key={expense.id}
                        data-state={selectedIds.has(expense.id) ? "selected" : "unchecked"}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          setContextMenuExpenseId(expense.id);
                        }}
                      >
                        <TableCell className="px-2">
                          <Checkbox
                            checked={selectedIds.has(expense.id)}
                            onCheckedChange={() => handleToggleSelect(expense.id)}
                            aria-label="Select transaction"
                          />
                        </TableCell>
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
                          <TransactionActionMenu
                            hasReceipt={!!expense.receiptFile}
                            hasRecurring={!!expense.recurringTransactionId}
                            onRecurringClick={() => window.location.href = `/dashboard/settings`}
                            onEdit={() => setEditingExpense(expenseData)}
                            onViewReceipt={() => setPreviewExpense({ id: expense.id })}
                            onUploadReceipt={() => setUploadingExpenseId(expense.id)}
                            onDelete={() => {
                              setExpenseToDelete(expense.id);
                              setDeleteConfirmOpen(true);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                      {contextMenuExpenseId === expense.id && (
                        <DropdownMenu open={true} onOpenChange={(open) => {
                          if (!open) setContextMenuExpenseId(null);
                        }}>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingExpense(expenseData);
                              setContextMenuExpenseId(null);
                            }}>Edit</DropdownMenuItem>
                            {expense.receiptFile && (
                              <DropdownMenuItem onClick={() => {
                                setPreviewExpense({ id: expense.id });
                                setContextMenuExpenseId(null);
                              }}>View Receipt</DropdownMenuItem>
                            )}
                            {!expense.receiptFile && (
                              <DropdownMenuItem onClick={() => {
                                setUploadingExpenseId(expense.id);
                                setContextMenuExpenseId(null);
                              }}>Upload Receipt</DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setExpenseToDelete(expense.id);
                              setDeleteConfirmOpen(true);
                              setContextMenuExpenseId(null);
                            }} variant="destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  );
                })
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
      {uploadingExpenseId && (
        <Dialog open={!!uploadingExpenseId} onOpenChange={(open) => {
          if (!open) setUploadingExpenseId(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Receipt</DialogTitle>
              <DialogDescription>Upload a receipt for this transaction</DialogDescription>
            </DialogHeader>
            <ReceiptUpload
              expenseId={uploadingExpenseId}
              onUploadComplete={() => {
                toast.success("Receipt uploaded successfully");
                utils.expenses.invalidate();
                setUploadingExpenseId(null);
              }}
            />
          </DialogContent>
        </Dialog>
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
      <BulkDeleteDialog
        open={bulkDeleteOpen}
        count={filteredSelectedIds.length}
        hasReceipts={hasReceiptsInSelection}
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleteOpen(false)}
      />
      <BulkCategoryDialog
        open={bulkCategoryOpen}
        count={filteredSelectedIds.length}
        onConfirm={handleBulkCategoryChange}
        onClose={() => setBulkCategoryOpen(false)}
      />
    </>
  );
}

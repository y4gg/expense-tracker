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
import { ReceiptUpload } from "./receipt-upload";
import { ReceiptPreviewDialog } from "./receipt-preview-dialog";

interface ExpenseFormData {
  amount: number;
  description: string;
  date: Date;
  categoryId?: string;
  type?: "expense" | "income";
  receiptFile?: string;
  receiptFileName?: string;
}

interface AddExpenseDialogProps {
  expense?: {
    id: string;
    amount: string;
    description: string;
    date: Date;
    categoryId?: string | null;
    type?: "expense" | "income";
    receiptFile?: string | null;
    receiptFileName?: string | null;
  };
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddExpenseDialog({ expense, children, open: controlledOpen, onOpenChange }: AddExpenseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setInternalOpen;
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
  const [type, setType] = useState<"expense" | "income">("expense");
  const [receiptFile, setReceiptFile] = useState("");
  const [receiptFileName, setReceiptFileName] = useState("");
  const [previewExpense, setPreviewExpense] = useState<{ id: string; description: string; amount: string; date: Date; category?: { name: string; color: string } | null } | null>(null);
  const utils = trpc.useUtils();

  useEffect(() => {
    if (expense) {
      setTimeout(() => {
        setAmount(expense.amount);
        setDescription(expense.description);
        setDate(expense.date.toISOString().split('T')[0]);
        setCategoryId(expense.categoryId ?? undefined);
        setType(expense.type ?? "expense");
        setReceiptFile(expense.receiptFile ?? "");
        setReceiptFileName(expense.receiptFileName ?? "");
      }, 0);
    } else if (!controlledOpen) {
      setTimeout(() => {
        setAmount("");
        setDescription("");
        setDate("");
        setCategoryId(undefined);
        setType("expense");
        setReceiptFile("");
        setReceiptFileName("");
      }, 0);
    }
  }, [expense, controlledOpen]);

  const categoriesQuery = trpc.categories.getAll.useQuery();

  const createMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Transaction created successfully");
      utils.expenses.invalidate();
      utils.categories.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to save transaction");
    },
  });

  const updateMutation = trpc.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Transaction updated successfully");
      utils.expenses.invalidate();
      utils.categories.invalidate();
      setOpen(false);
    },
    onError: () => {
      toast.error("Failed to save transaction");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: ExpenseFormData = {
      amount: parseFloat(amount),
      description,
      date: new Date(date),
      categoryId,
      type,
    receiptFile,
      receiptFileName,
    };

    if (expense) {
      updateMutation.mutate({ id: expense.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getDialogTitle = () => {
    if (expense) return type === "income" ? "Edit Income" : "Edit Expense";
    return type === "income" ? "Add Income" : "Add Expense";
  };

  const getDialogDescription = () => {
    if (expense) return "Update your transaction details";
    return type === "income" ? "Add a new income to track" : "Add a new expense to track";
  };

  const handleReceiptDelete = () => {
    if (expense && expense.receiptFile) {
      setReceiptFile("");
      setReceiptFileName("");
      toast.success("Receipt removed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            <DialogDescription>{getDialogDescription()}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={type === "expense" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("expense")}
                >
                  Expense
                </Button>
                <Button
                  type="button"
                  variant={type === "income" ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setType("income")}
                >
                  Income
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
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
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="Lunch at restaurant"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
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
            {(expense || receiptFile) && (
              <ReceiptUpload expenseId={expense?.id || ""} onUploadComplete={(data) => {
                setReceiptFile(data.fileName);
                setReceiptFileName(data.fileName);
              }} />
            )}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : expense ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
      {expense && receiptFile && (
        <ReceiptPreviewDialog
          expenseId={expense.id}
          receiptFile={receiptFile || null}
          receiptFileName={receiptFileName || null}
          open={previewExpense !== null}
          onClose={() => {
            setPreviewExpense(null);
            if (expense?.receiptFile) {
              setReceiptFile(expense.receiptFile);
              setReceiptFileName(expense.receiptFileName || "");
            }
          }}
          onDelete={handleReceiptDelete}
        />
      )}
    </Dialog>
  );
}

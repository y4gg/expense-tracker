"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/react";

export interface BulkCategoryDialogProps {
  open: boolean;
  count: number;
  onClose: () => void;
  onConfirm: (categoryId: string | null) => void;
}

export function BulkCategoryDialog({ open, count, onClose, onConfirm }: BulkCategoryDialogProps) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const categoriesQuery = trpc.categories.getAll.useQuery();

  const handleConfirm = () => {
    onConfirm(categoryId);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Category</DialogTitle>
          <DialogDescription>
            Select a category for {count} transaction{count !== 1 ? "s" : ""}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId ?? ""} onValueChange={(value) => setCategoryId(value || null)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category (leave empty to uncategorize)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Uncategorized</SelectItem>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!categoryId}>
            Apply to {count} Transaction{count !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

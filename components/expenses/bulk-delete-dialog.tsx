import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface BulkDeleteDialogProps {
  open: boolean;
  count: number;
  hasReceipts: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function BulkDeleteDialog({ open, count, hasReceipts, onConfirm, onClose }: BulkDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {count} Transaction{count !== 1 ? "s" : ""}</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {count} transaction{count !== 1 ? "s" : ""}? This action cannot be undone.
            {hasReceipts && " Receipts will also be deleted from storage."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete {count} Transaction{count !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

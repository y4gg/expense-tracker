"use client";

import { X, Download, Trash2, FileImage, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ReceiptPreviewDialogProps {
  expenseId: string;
  receiptFile: string | null;
  receiptFileName: string | null;
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function ReceiptPreviewDialog({
  expenseId,
  receiptFile,
  receiptFileName,
  open,
  onClose,
  onDelete,
}: ReceiptPreviewDialogProps) {
  const isImage = receiptFile?.match(/\.(jpg|jpeg|png|webp)$/i);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Receipt Preview</DialogTitle>
              <DialogDescription>
                {expenseId ? `Receipt for transaction` : "Receipt"}
                {isImage && (
                  <>
                    {" "}
                    <FileImage className="inline h-4 w-4" />
                  </>
                )}
                {!isImage && (
                  <>
                    {" "}
                    <FileText className="inline h-4 w-4" />
                  </>
                )}
              </DialogDescription>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <DialogContent className="p-0">
          {isImage && receiptFile ? (
            <img
              src={`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc/expenses.getPresignedReceiptUrl?expenseId=${expenseId}`}
              alt={receiptFileName || "Receipt"}
              className="w-full h-auto object-contain"
            />
          ) : receiptFile && !isImage ? (
            <iframe
              src={`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc/expenses.getPresignedReceiptUrl?expenseId=${expenseId}`}
              title={receiptFileName || "Receipt"}
              className="w-full h-[70vh]"
            />
          ) : null}
        </DialogContent>

        <DialogFooter>
          <div className="flex items-center justify-between">
            {receiptFile && isImage && (
              <a
                href={`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/trpc/expenses.getPresignedReceiptUrl?expenseId=${expenseId}`}
                download={receiptFileName || "Receipt"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="default">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </a>
            )}
            {onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

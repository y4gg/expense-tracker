import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, RotateCw, FileImage, Upload } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TransactionActionMenuProps {
  onEdit: () => void;
  onViewReceipt: () => void;
  onUploadReceipt: () => void;
  onDelete: () => void;
  hasReceipt: boolean;
  hasRecurring: boolean;
  onRecurringClick: () => void;
}

export function TransactionActionMenu({
  onEdit,
  onViewReceipt,
  onUploadReceipt,
  onDelete,
  hasReceipt,
  hasRecurring,
  onRecurringClick,
}: TransactionActionMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {hasRecurring && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          onClick={onRecurringClick}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
        onClick={hasReceipt ? onViewReceipt : onUploadReceipt}
      >
        {hasReceipt ? <FileImage className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      </Button>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          {hasReceipt && (
            <DropdownMenuItem onClick={onViewReceipt}>View Receipt</DropdownMenuItem>
          )}
          {!hasReceipt && (
            <DropdownMenuItem onClick={onUploadReceipt}>Upload Receipt</DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onDelete} variant="destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

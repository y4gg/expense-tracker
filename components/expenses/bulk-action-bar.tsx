import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface BulkActionBarProps {
  count: number;
  onClearSelection: () => void;
  onChangeCategory: () => void;
  onDelete: () => void;
}

export function BulkActionBar({ count, onClearSelection, onChangeCategory, onDelete }: BulkActionBarProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
      <p className="text-sm font-medium">
        {count} transaction{count !== 1 ? "s" : ""} selected
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onChangeCategory}>
          Change Category
        </Button>
        <Button variant="destructive" size="sm" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="ghost" size="icon" onClick={onClearSelection}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal } from "lucide-react";
import { trpc } from "@/trpc/react";
import { AddCategoryDialog } from "@/components/expenses/add-category-dialog";
import { EditCategoryDialog } from "@/components/expenses/edit-category-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = trpc.categories.getAll.useQuery();
  const utils = trpc.useUtils();

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      utils.categories.invalidate();
    },
  });

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutate({ id });
    } catch {
      toast.error("Failed to delete category");
    }
  };

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Categories</h1>
          <p className="mt-2 text-lg text-muted-foreground">Manage your expense and income categories</p>
        </div>
        <AddCategoryDialog>
          <Button size="default">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </AddCategoryDialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-40">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : categories.length === 0 ? (
        <div className="flex items-center justify-center min-h-40 text-muted-foreground">
          <p className="text-base">No categories yet</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border bg-card text-card-foreground shadow-md p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <h3 className="text-base font-semibold">{category.name}</h3>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <EditCategoryDialog
                      categoryId={category.id}
                      currentName={category.name}
                      currentColor={category.color}
                    >
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                      </DropdownMenuItem>
                    </EditCategoryDialog>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDelete(category.id)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

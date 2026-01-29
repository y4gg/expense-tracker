"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { trpc } from "@/trpc/react";
import { AddCategoryDialog } from "@/components/expenses/add-category-dialog";

export default function CategoriesPage() {
  const { data: categories = [], isLoading } = trpc.categories.getAll.useQuery();

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div key={category.id} className="rounded-lg border bg-card text-card-foreground shadow-md p-4">
              <div className="flex items-center gap-2">
                <div
                  className="h-14 w-14 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { trpc } from "@/trpc/react";
import { AddCategoryDialog } from "@/components/expenses/add-category-dialog";

export default function CategoriesPage() {
  const [open, setOpen] = useState(false);
  const { data: categories = [] } = trpc.categories.getAll.useQuery();
  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      setOpen(false);
    },
  });

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div key={category.id} className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="h-16 w-16 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <h3 className="text-xl font-semibold">{category.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

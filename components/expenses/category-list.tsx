"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AddCategoryDialog } from "./add-category-dialog";
import { trpc } from "@/trpc/react";
import { Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully");
      utils.categories.invalidate();
    },
  });

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-xl">Categories</CardTitle>
          <AddCategoryDialog>
            <Button size="default">Add Category</Button>
          </AddCategoryDialog>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-wrap gap-3">
          {categories.length === 0 ? (
            <div className="flex min-h-32 items-center justify-center text-center text-muted-foreground">
              <p className="text-base">No categories yet</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="group flex items-center gap-2">
                <Badge
                  style={{ backgroundColor: category.color }}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-opacity group-hover:opacity-80"
                >
                  {category.name}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => deleteMutation.mutate({ id: category.id })}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { getCategories } from "@/actions/expenses";
import { CategoryList } from "@/components/expenses/category-list";
import { AddCategoryDialog } from "@/components/expenses/add-category-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CategoriesPage() {
  const categories = await getCategories();

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

      <CategoryList categories={categories} />
    </>
  );
}

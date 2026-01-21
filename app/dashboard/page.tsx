import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCategories, getExpenses } from "@/actions/expenses";
import { CategoryList } from "@/components/expenses/category-list";
import { ExpenseList } from "@/components/expenses/expense-list";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { auth } from "@/lib/auth";

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/auth/signin");
  }

  const categories = await getCategories();
  const params = await searchParams;
  const expenses = await getExpenses(params.category);

  const total = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto p-4 md:p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Expense Tracker</h1>
            <p className="text-muted-foreground">Welcome back, {session.user.name}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="md:col-span-1 lg:col-span-1">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
              <div className="flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Total Expenses</h3>
              </div>
              <div className="p-6 pt-0">
                <p className="text-4xl font-bold">${total.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <CategoryList categories={categories} />
        </div>

        <ExpenseList expenses={expenses} categories={categories} />
      </div>
    </div>
  );
}

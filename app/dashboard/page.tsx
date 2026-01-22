import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCategories, getExpenses, getFinancialSummary } from "@/actions/expenses";
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
  const summary = await getFinancialSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Financial Tracker</h1>
            <p className="mt-1 text-lg text-muted-foreground">Welcome back, {session.user.name}</p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 mb-12">
          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Income</h3>
            <p className="mt-4 text-5xl font-bold tracking-tight text-green-600 dark:text-green-500">${summary.totalIncome.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</h3>
            <p className="mt-4 text-5xl font-bold tracking-tight text-red-600 dark:text-red-500">${summary.totalExpenses.toFixed(2)}</p>
          </div>

          <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Balance</h3>
            <p className={`mt-4 text-5xl font-bold tracking-tight ${summary.netBalance >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
              ${summary.netBalance.toFixed(2)}
            </p>
          </div>

          <CategoryList categories={categories} />
        </div>

        <ExpenseList expenses={expenses} categories={categories} />
      </div>
    </div>
  );
}

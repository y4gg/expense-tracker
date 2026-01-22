import { getFinancialSummary } from "@/actions/expenses";

export default async function DashboardPage() {
  const summary = await getFinancialSummary();

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Overview of your finances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
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
      </div>
    </>
  );
}

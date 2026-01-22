import { headers } from "next/headers";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return null;
  }

  const result = await db
    .select({
      type: expense.type,
      total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
    })
    .from(expense)
    .where(eq(expense.userId, session.user.id))
    .groupBy(expense.type);

  const incomeEntry = result.find((r) => r.type === "income");
  const expenseEntry = result.find((r) => r.type === "expense");

  const totalIncome = incomeEntry?.total ? parseFloat(incomeEntry.total.toString()) : 0;
  const totalExpenses = expenseEntry?.total ? parseFloat(expenseEntry.total.toString()) : 0;
  const netBalance = totalIncome - totalExpenses;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">Overview of your finances</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Income</h3>
          <p className="mt-4 text-5xl font-bold tracking-tight text-green-600 dark:text-green-500">{totalIncome.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Expenses</h3>
          <p className="mt-4 text-5xl font-bold tracking-tight text-red-600 dark:text-red-500">{totalExpenses.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-md p-6">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Net Balance</h3>
          <p className={`mt-4 text-5xl font-bold tracking-tight ${netBalance >= 0 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"}`}>
            {netBalance.toFixed(2)}
          </p>
        </div>
      </div>
    </>
  );
}

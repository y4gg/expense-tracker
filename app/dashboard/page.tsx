import { headers } from "next/headers";
import { db } from "@/db";
import { expense } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

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

      <DashboardContent
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
        netBalance={netBalance}
      />
    </>
  );
}

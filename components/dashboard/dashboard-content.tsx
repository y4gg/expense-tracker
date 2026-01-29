"use client";

import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MonthlyIncomeExpenseChart } from "@/components/dashboard/charts/monthly-income-expense-chart";
import { CategoryBreakdownChart } from "@/components/dashboard/charts/category-breakdown-chart";
import { BalanceTrendChart } from "@/components/dashboard/charts/balance-trend-chart";

interface DashboardContentProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export function DashboardContent({ totalIncome, totalExpenses, netBalance }: DashboardContentProps) {
  const [timeRange, setTimeRange] = React.useState<string>("6");

  return (
    <>
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

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Charts</h2>
          <p className="text-sm text-muted-foreground">Visualize your financial data</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]" aria-label="Select time range">
            <SelectValue placeholder="Last 6 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="1" className="rounded-lg">Last month</SelectItem>
            <SelectItem value="3" className="rounded-lg">Last 3 months</SelectItem>
            <SelectItem value="6" className="rounded-lg">Last 6 months</SelectItem>
            <SelectItem value="12" className="rounded-lg">Last 12 months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
        <MonthlyIncomeExpenseChart timeRange={timeRange} />
        <CategoryBreakdownChart timeRange={timeRange} />
      </div>

      <BalanceTrendChart timeRange={timeRange} />
    </>
  );
}

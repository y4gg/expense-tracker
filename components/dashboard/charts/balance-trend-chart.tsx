"use client";

import { Line, Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { trpc } from "@/trpc/react";
import { BalanceTrendSkeleton } from "./chart-skeleton";

const chartConfig = {
  balance: {
    label: "Balance",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function BalanceTrendChart() {
  const { data: monthlyData, isLoading } = trpc.expenses.getMonthlyTotals.useQuery();

  if (isLoading) {
    return <BalanceTrendSkeleton />;
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Balance Trend</CardTitle>
          <CardDescription>No data available for last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Add some transactions to see your balance trend</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const balanceData = monthlyData.reduce<{ month: string; balance: number }[]>(
    (acc, month) => {
      const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0;
      acc.push({
        month: month.month,
        balance: previousBalance + (month.income - month.expense),
      });
      return acc;
    },
    []
  );

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Balance Trend</CardTitle>
        <CardDescription>Your net balance over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <AreaChart accessibilityLayer data={balanceData}>
            <defs>
              <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-balance)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-balance)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={60}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="balance"
              type="natural"
              fill="url(#fillBalance)"
              stroke="var(--color-balance)"
            />
            <Line
              dataKey="balance"
              type="natural"
              stroke="var(--color-balance)"
              strokeWidth={2}
              dot={{ fill: "var(--color-balance)" }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

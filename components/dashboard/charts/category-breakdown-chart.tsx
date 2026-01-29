"use client";

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { trpc } from "@/trpc/react";
import { CategoryChartSkeleton } from "./chart-skeleton";

interface CategoryData {
  name: string;
  value: number;
  fill: string;
}

export function CategoryBreakdownChart() {
  const { data: categoryData, isLoading } = trpc.expenses.getCategoryBreakdown.useQuery();

  if (isLoading) {
    return <CategoryChartSkeleton />;
  }

  if (!categoryData || categoryData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>No expense data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Add some expenses to see your breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData: CategoryData[] = categoryData.slice(0, 8).map((cat) => ({
    name: cat.category.name,
    value: cat.total,
    fill: cat.category.color,
  })) as CategoryData[];

  const chartConfig: ChartConfig = chartData.reduce((acc: ChartConfig, cat: CategoryData) => {
    const key = cat.name.toLowerCase().replace(/\s+/g, "-");
    acc[key] = {
      label: cat.name,
      color: cat.fill,
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Your spending breakdown by category (last 6 months)</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer config={chartConfig}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              labelLine={false}
              label={({ name, percent }: { name?: string; percent?: number }) =>
                `${name} (${percent ? (percent * 100).toFixed(0) : 0}%)`
              }
            >
              <ChartTooltip content={<ChartTooltipContent />} />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

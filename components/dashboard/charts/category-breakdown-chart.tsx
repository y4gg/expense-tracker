"use client";

import * as React from "react";
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

interface CategoryBreakdownChartProps {
  timeRange: string;
}

export function CategoryBreakdownChart({ timeRange }: CategoryBreakdownChartProps) {
  const { data: categoryData, isLoading } = trpc.expenses.getCategoryBreakdown.useQuery({ months: Number(timeRange) });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenses by Category</CardTitle>
        <CardDescription>Your spending breakdown by category</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {isLoading ? (
          <CategoryChartSkeleton />
        ) : !categoryData || categoryData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center">
            <p className="text-muted-foreground">Add some expenses to see your breakdown</p>
          </div>
        ) : (
          <>
            {(() => {
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
              );
            })()}
          </>
        )}
      </CardContent>
    </Card>
  );
}

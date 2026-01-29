"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { FundGoalDialog } from "@/components/goals/fund-goal-dialog";
import { trpc } from "@/trpc/react";
import { toast } from "sonner";
import { Pencil, Trash2, Target, PiggyBank, Wallet, Car, Home, Plane, GraduationCap, Heart } from "lucide-react";
import { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  PiggyBank,
  Wallet,
  Car,
  Home,
  Plane,
  GraduationCap,
  Heart,
};

interface SavingsGoalsListProps {
  limit?: number;
}

export function SavingsGoalsList({ limit }: SavingsGoalsListProps) {
  const [editGoal, setEditGoal] = useState<{ id: string; name: string; targetAmount: number; targetDate: Date; icon: string; color: string } | undefined>(undefined);
  const [fundGoal, setFundGoal] = useState<string | undefined>(undefined);

  const { data: goals, isLoading } = trpc.goals.getAll.useQuery();

  const deleteMutation = trpc.goals.delete.useMutation({
    onSuccess: () => {
      toast.success("Goal deleted successfully");
      utils.goals.invalidate();
    },
    onError: () => {
      toast.error("Failed to delete goal");
    },
  });

  const utils = trpc.useUtils();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this savings goal?")) {
      deleteMutation.mutate({ id });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDaysRemaining = (targetDate: Date) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diff = target.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const displayGoals = limit && goals ? goals.slice(0, limit) : goals;

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-md">
        <CardHeader>
          <CardTitle>Savings Goals</CardTitle>
          <CardDescription>Loading goals...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track your progress toward your financial goals</CardDescription>
          </div>
          <AddGoalDialog>
            <Button variant="outline">Add Goal</Button>
          </AddGoalDialog>
        </div>
      </CardHeader>
      <CardContent>
        {!displayGoals || displayGoals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No savings goals set. Click &quot;Add Goal&quot; to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {displayGoals.map((goal) => {
              const IconComponent = ICON_MAP[goal.icon] || Target;
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const isCompleted = goal.percentage >= 100;

              return (
                <div key={goal.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <IconComponent className="h-5 w-5" style={{ color: goal.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.name}</span>
                          {isCompleted && <Badge variant="default" className="bg-green-500">Completed</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          {daysRemaining > 0 ? (
                            <span>{daysRemaining} days left</span>
                          ) : (
                            <span className="text-destructive">Target date passed</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFundGoal(goal.id)}
                        disabled={isCompleted}
                      >
                        <PiggyBank className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditGoal(goal)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Progress value={Math.min(goal.percentage, 100)} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className={goal.percentage >= 100 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                        {goal.percentage.toFixed(1)}%
                      </span>
                    </div>
                    {!isCompleted && goal.remaining > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {formatCurrency(goal.remaining)} to go
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {editGoal && (
        <AddGoalDialog
          goal={editGoal}
          open={!!editGoal}
          onOpenChange={(open) => !open && setEditGoal(undefined)}
        />
      )}
      {fundGoal && (
        <FundGoalDialog
          goalId={fundGoal}
          open={!!fundGoal}
          onOpenChange={(open: boolean) => !open && setFundGoal(undefined)}
        />
      )}
    </Card>
  );
}

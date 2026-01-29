import { BudgetList } from "@/components/budget/budget-list";
import { SavingsGoalsList } from "@/components/goals/savings-goals-list";

export default function BudgetPage() {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Budgets & Goals</h1>
        <p className="mt-2 text-lg text-muted-foreground">Manage your spending limits and savings targets</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetList />
        <SavingsGoalsList />
      </div>
    </>
  );
}

import { expensesRouter } from "./routers/expenses";
import { categoriesRouter } from "./routers/categories";
import { recurringRouter } from "./routers/recurring";
import { budgetsRouter } from "./routers/budgets";
import { goalsRouter } from "./routers/goals";
import { t } from "./trpc";

export const appRouter = t.router({
  expenses: expensesRouter,
  categories: categoriesRouter,
  recurring: recurringRouter,
  budgets: budgetsRouter,
  goals: goalsRouter,
});

export type AppRouter = typeof appRouter;

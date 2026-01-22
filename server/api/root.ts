import { expensesRouter } from "./routers/expenses";
import { categoriesRouter } from "./routers/categories";
import { recurringRouter } from "./routers/recurring";
import { t } from "./trpc";

export const appRouter = t.router({
  expenses: expensesRouter,
  categories: categoriesRouter,
  recurring: recurringRouter,
});

export type AppRouter = typeof appRouter;

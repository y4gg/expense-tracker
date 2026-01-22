import { expensesRouter } from "./routers/expenses";
import { categoriesRouter } from "./routers/categories";
import { t } from "./trpc";

export const appRouter = t.router({
  expenses: expensesRouter,
  categories: categoriesRouter,
});

export type AppRouter = typeof appRouter;

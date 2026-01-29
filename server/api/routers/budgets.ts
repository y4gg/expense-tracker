import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, sql, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { budget, category, expense } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";

export const budgetsRouter = t.router({
  getAll: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const budgets = await db
        .select({
          id: budget.id,
          amount: budget.amount,
          categoryId: budget.categoryId,
          category: {
            id: category.id,
            name: category.name,
            color: category.color,
          },
        })
        .from(budget)
        .leftJoin(category, eq(budget.categoryId, category.id))
        .where(eq(budget.userId, ctx.session.user.id))
        .orderBy(category.name);

      return budgets.map((budget) => ({
        ...budget,
        amount: parseFloat(budget.amount.toString()),
      }));
    }),

  getWithActuals: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const budgets = await db
        .select({
          id: budget.id,
          amount: budget.amount,
          categoryId: budget.categoryId,
          category: {
            id: category.id,
            name: category.name,
            color: category.color,
          },
        })
        .from(budget)
        .leftJoin(category, eq(budget.categoryId, category.id))
        .where(eq(budget.userId, ctx.session.user.id))
        .orderBy(category.name);

      const budgetsData = budgets.map((budget) => ({
        id: budget.id,
        amount: parseFloat(budget.amount.toString()),
        categoryId: budget.categoryId,
        category: budget.category,
      }));

      const budgetIds = budgetsData.map((b) => b.categoryId).filter(Boolean);

      const actuals = budgetIds.length > 0 ? await db
        .select({
          categoryId: expense.categoryId,
          total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
        })
        .from(expense)
        .where(
          and(
            eq(expense.userId, ctx.session.user.id),
            eq(expense.type, "expense"),
            budgetIds.length > 0 ? sql`${expense.categoryId} IN ${budgetIds}` : sql`1=0`,
            gte(expense.date, startDate),
            lte(expense.date, endDate)
          )
        )
        .groupBy(expense.categoryId) : [];

      const actualMap = new Map(
        actuals.map((a) => [a.categoryId, parseFloat(a.total.toString())])
      );

      return budgetsData.map((budget) => ({
        ...budget,
        actual: actualMap.get(budget.categoryId) || 0,
        remaining: budget.amount - (actualMap.get(budget.categoryId) || 0),
        percentage: ((actualMap.get(budget.categoryId) || 0) / budget.amount) * 100,
      }));
    }),

  create: t.procedure
    .input(
      z.object({
        categoryId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a budget",
        });
      }

      const existing = await db
        .select()
        .from(budget)
        .where(
          and(
            eq(budget.userId, ctx.session.user.id),
            eq(budget.categoryId, input.categoryId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Budget already exists for this category",
        });
      }

      await db.insert(budget).values({
        id: nanoid(),
        categoryId: input.categoryId,
        amount: input.amount.toString(),
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a budget",
        });
      }

      const existing = await db
        .select()
        .from(budget)
        .where(and(eq(budget.id, input.id), eq(budget.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      await db
        .update(budget)
        .set({ amount: input.amount.toString() })
        .where(eq(budget.id, input.id));

      return { success: true };
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a budget",
        });
      }

      const existing = await db
        .select()
        .from(budget)
        .where(and(eq(budget.id, input.id), eq(budget.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Budget not found",
        });
      }

      await db.delete(budget).where(eq(budget.id, input.id));

      return { success: true };
    }),

  getSummary: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          budgetCount: 0,
        };
      }

      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

      const budgets = await db
        .select({
          amount: budget.amount,
          categoryId: budget.categoryId,
        })
        .from(budget)
        .where(eq(budget.userId, ctx.session.user.id));

      const budgetIds = budgets.map((b) => b.categoryId).filter(Boolean);

      if (budgetIds.length === 0) {
        return {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          budgetCount: 0,
        };
      }

      const actuals = await db
        .select({
          categoryId: expense.categoryId,
          total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
        })
        .from(expense)
        .where(
          and(
            eq(expense.userId, ctx.session.user.id),
            eq(expense.type, "expense"),
            sql`${expense.categoryId} IN ${budgetIds}`,
            gte(expense.date, startDate),
            lte(expense.date, endDate)
          )
        )
        .groupBy(expense.categoryId);

      const actualMap = new Map(
        actuals.map((a) => [a.categoryId, parseFloat(a.total.toString())])
      );

      const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.amount.toString()), 0);
      const totalSpent = budgets.reduce((sum, b) => sum + (actualMap.get(b.categoryId) || 0), 0);
      const totalRemaining = totalBudget - totalSpent;

      return {
        totalBudget,
        totalSpent,
        totalRemaining,
        budgetCount: budgets.length,
      };
    }),
});

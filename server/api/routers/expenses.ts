import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc } from "drizzle-orm";
import { db } from "@/db";
import { expense, category } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";

export const expensesRouter = t.router({
  getAll: t.procedure
    .input(
      z.object({
        categoryId: z.string().optional(),
        type: z.enum(["expense", "income"]).optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const conditions = [eq(expense.userId, ctx.session.user.id)];

      if (input?.categoryId) {
        conditions.push(eq(expense.categoryId, input.categoryId));
      }

      if (input?.type) {
        conditions.push(eq(expense.type, input.type));
      }

      const expenses = await db
        .select({
          id: expense.id,
          amount: expense.amount,
          description: expense.description,
          date: expense.date,
          categoryId: expense.categoryId,
          type: expense.type,
          recurringTransactionId: expense.recurringTransactionId,
          category: {
            id: category.id,
            name: category.name,
            color: category.color,
          },
        })
        .from(expense)
        .leftJoin(category, eq(expense.categoryId, category.id))
        .where(and(...conditions))
        .orderBy(desc(expense.date));

      return expenses.map((expense) => ({
        ...expense,
        date: expense.date.toISOString(),
      }));
    }),

  create: t.procedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1).max(500),
        date: z.date(),
        categoryId: z.string().optional(),
        type: z.enum(["expense", "income"]).default("expense"),
        recurringTransactionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create an expense",
        });
      }

      await db.insert(expense).values({
        id: nanoid(),
        amount: input.amount.toString(),
        description: input.description,
        date: input.date,
        categoryId: input.categoryId || null,
        type: input.type,
        recurringTransactionId: input.recurringTransactionId || null,
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        amount: z.number().positive().optional(),
        description: z.string().min(1).max(500).optional(),
        date: z.date().optional(),
        categoryId: z.string().optional(),
        type: z.enum(["expense", "income"]).optional(),
        recurringTransactionId: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update an expense",
        });
      }

      const existing = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.id), eq(expense.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      await db
        .update(expense)
        .set({
          amount: input.amount?.toString() || existing[0].amount,
          description: input.description || existing[0].description,
          date: input.date || existing[0].date,
          categoryId: input.categoryId || existing[0].categoryId,
          type: input.type || existing[0].type,
          recurringTransactionId: input.recurringTransactionId || existing[0].recurringTransactionId,
        })
        .where(eq(expense.id, input.id));

      return { success: true };
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete an expense",
        });
      }

      const existing = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.id), eq(expense.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      await db.delete(expense).where(eq(expense.id, input.id));

      return { success: true };
    }),

  getSummary: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return {
          totalIncome: 0,
          totalExpenses: 0,
          netBalance: 0,
        };
      }

      const result = await db
        .select({
          type: expense.type,
          total: expense.amount,
        })
        .from(expense)
        .where(eq(expense.userId, ctx.session.user.id))
        .groupBy(expense.type);

      const incomeEntry = result.find((r) => r.type === "income");
      const expenseEntry = result.find((r) => r.type === "expense");

      const totalIncome = incomeEntry?.total ? parseFloat(incomeEntry.total.toString()) : 0;
      const totalExpenses = expenseEntry?.total ? parseFloat(expenseEntry.total.toString()) : 0;

      return {
        totalIncome,
        totalExpenses,
        netBalance: totalIncome - totalExpenses,
      };
    }),
});

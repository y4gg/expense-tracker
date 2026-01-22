import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, lt } from "drizzle-orm";
import { db } from "@/db";
import { expense, recurringTransaction } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

function add3Days(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 3);
  return result;
}

export const recurringRouter = t.router({
  getAll: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const recurringTransactions = await db
        .select()
        .from(recurringTransaction)
        .where(eq(recurringTransaction.userId, ctx.session.user.id))
        .orderBy(desc(recurringTransaction.nextDueDate));

       return recurringTransactions;
    }),

  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in",
        });
      }

      const recurring = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.id), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!recurring.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      return recurring[0];
    }),

  create: t.procedure
    .input(
      z.object({
        amount: z.number().positive(),
        description: z.string().min(1).max(500),
        categoryId: z.string().optional(),
        type: z.enum(["expense", "income"]).default("expense"),
        frequency: z.enum(["daily", "every3days", "weekly", "biweekly", "monthly", "quarterly", "yearly"]),
        nextDueDate: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a recurring transaction",
        });
      }

      await db.insert(recurringTransaction).values({
        id: nanoid(),
        amount: input.amount.toString(),
        description: input.description,
        categoryId: input.categoryId || null,
        type: input.type,
        frequency: input.frequency,
        nextDueDate: input.nextDueDate,
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
        categoryId: z.string().optional(),
        type: z.enum(["expense", "income"]).optional(),
        frequency: z.enum(["daily", "every3days", "weekly", "biweekly", "monthly", "quarterly", "yearly"]).optional(),
        nextDueDate: z.date().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a recurring transaction",
        });
      }

      const existing = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.id), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      await db
        .update(recurringTransaction)
        .set({
          amount: input.amount?.toString() || existing[0].amount,
          description: input.description || existing[0].description,
          categoryId: input.categoryId || existing[0].categoryId,
          type: input.type || existing[0].type,
          frequency: input.frequency || existing[0].frequency,
          nextDueDate: input.nextDueDate || existing[0].nextDueDate,
          isActive: input.isActive ?? existing[0].isActive,
        })
        .where(eq(recurringTransaction.id, input.id));

      return { success: true };
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a recurring transaction",
        });
      }

      const existing = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.id), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      await db.delete(recurringTransaction).where(eq(recurringTransaction.id, input.id));

      return { success: true };
    }),

  toggleActive: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a recurring transaction",
        });
      }

      const existing = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.id), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      const newStatus = !existing[0].isActive;

      await db
        .update(recurringTransaction)
        .set({ isActive: newStatus })
        .where(eq(recurringTransaction.id, input.id));

      return { isActive: newStatus };
    }),

  createExpense: t.procedure
    .input(z.object({ recurringTransactionId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create an expense",
        });
      }

      const recurring = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.recurringTransactionId), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!recurring.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      if (!recurring[0].isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot create expense from inactive recurring transaction",
        });
      }

      const existingRecurring = recurring[0];

      await db.insert(expense).values({
        id: nanoid(),
        amount: existingRecurring.amount.toString(),
        description: existingRecurring.description,
        date: new Date(),
        categoryId: existingRecurring.categoryId,
        type: existingRecurring.type,
        recurringTransactionId: existingRecurring.id,
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  updateNextDueDate: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a recurring transaction",
        });
      }

      const recurring = await db
        .select()
        .from(recurringTransaction)
        .where(and(eq(recurringTransaction.id, input.id), eq(recurringTransaction.userId, ctx.session.user.id)))
        .limit(1);

      if (!recurring.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Recurring transaction not found",
        });
      }

      const { frequency } = recurring[0];
      const currentDueDate = new Date(recurring[0].nextDueDate);

      let nextDueDate: Date;
      switch (frequency) {
        case "daily":
          nextDueDate = addDays(currentDueDate, 1);
          break;
        case "every3days":
          nextDueDate = add3Days(currentDueDate);
          break;
        case "weekly":
          nextDueDate = addDays(currentDueDate, 7);
          break;
        case "biweekly":
          nextDueDate = addDays(currentDueDate, 14);
          break;
        case "monthly":
          nextDueDate = addMonths(currentDueDate, 1);
          break;
        case "quarterly":
          nextDueDate = addMonths(currentDueDate, 3);
          break;
        case "yearly":
          nextDueDate = addYears(currentDueDate, 1);
          break;
        default:
          nextDueDate = currentDueDate;
      }

      const now = new Date();

      await db
        .update(recurringTransaction)
        .set({
          nextDueDate: nextDueDate,
          lastTriggeredDate: now,
        })
        .where(eq(recurringTransaction.id, input.id));

      return { nextDueDate, lastTriggeredDate: now };
    }),

  checkDue: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const now = new Date();

      const dueTransactions = await db
        .select()
        .from(recurringTransaction)
        .where(and(
          eq(recurringTransaction.userId, ctx.session.user.id),
          eq(recurringTransaction.isActive, true),
          lt(recurringTransaction.nextDueDate, now),
        ))
        .orderBy(recurringTransaction.nextDueDate);

      return dueTransactions;
    }),
});

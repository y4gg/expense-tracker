import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import { db } from "@/db";
import { expense, category } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";
import { uploadReceipt, getPresignedUrl, deleteReceipt } from "@/lib/s3";

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
          receiptFile: expense.receiptFile,
          receiptFileName: expense.receiptFileName,
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
        receiptFile: z.string().optional(),
        receiptFileName: z.string().optional(),
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
        receiptFile: input.receiptFile || null,
        receiptFileName: input.receiptFileName || null,
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
        receiptFile: z.string().optional(),
        receiptFileName: z.string().optional(),
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
          receiptFile: input.receiptFile || existing[0].receiptFile,
          receiptFileName: input.receiptFileName || existing[0].receiptFileName,
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

      const existingExpense = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.id), eq(expense.userId, ctx.session.user.id)))
        .limit(1);

      if (!existingExpense.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      if (existingExpense[0].receiptFile) {
        await deleteReceipt(existingExpense[0].receiptFile);
      }

      await db.delete(expense).where(eq(expense.id, input.id));

      return { success: true };
    }),

  uploadReceipt: t.procedure
    .input(
      z.object({
        expenseId: z.string(),
        file: z.any(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to upload a receipt",
        });
      }

      const existingExpense = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.expenseId), eq(expense.userId, ctx.session.user.id)))
        .limit(1);

      if (!existingExpense.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      const file = input.file as File;

      if (file.size > 10 * 1024 * 1024) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Receipt file must be under 10MB",
        });
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];

      if (!file.type || !file.name) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid file",
        });
      }

      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf("."));

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File type "${file.type}" (${fileExtension}) not supported. Only JPG, PNG, WebP, and PDF files are supported`,
        });
      }

      const { filePath, fileName } = await uploadReceipt(ctx.session.user.id, input.expenseId, file);

      await db
        .update(expense)
        .set({
          receiptFile: filePath,
          receiptFileName: fileName,
        })
        .where(eq(expense.id, input.expenseId));

      return {
        success: true,
        filePath,
        fileName,
      };
    }),

  getPresignedReceiptUrl: t.procedure
    .input(z.object({ expenseId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to get receipt URL",
        });
      }

      const existingExpense = await db
        .select()
        .from(expense)
        .where(and(eq(expense.id, input.expenseId), eq(expense.userId, ctx.session.user.id)))
        .limit(1);

      if (!existingExpense.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
        });
      }

      if (!existingExpense[0].receiptFile) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "No receipt uploaded for this expense",
        });
      }

      const url = await getPresignedUrl(existingExpense[0].receiptFile);

      return {
        url,
        fileName: existingExpense[0].receiptFileName,
      };
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
          total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
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

  getMonthlyTotals: t.procedure
    .input(z.object({ months: z.number().optional().default(6) }).optional())
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const months = input?.months ?? 6;
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - (months - 1));
      monthsAgo.setDate(1);
      monthsAgo.setHours(0, 0, 0, 0);

      const result = await db
        .select({
          month: sql<string>`DATE_TRUNC('month', ${expense.date})::text`,
          type: expense.type,
          total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
        })
        .from(expense)
        .where(and(eq(expense.userId, ctx.session.user.id), gte(expense.date, monthsAgo)))
        .groupBy(sql`DATE_TRUNC('month', ${expense.date})`, expense.type)
        .orderBy(sql`DATE_TRUNC('month', ${expense.date})`);

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const monthlyData = result.reduce((acc, row) => {
        const date = new Date(row.month);
        const monthKey = monthNames[date.getMonth()];
        const year = date.getFullYear();

        const key = `${monthKey} ${year}`;
        if (!acc[key]) {
          acc[key] = { month: monthKey, income: 0, expense: 0 };
        }

        if (row.type === "income") {
          acc[key].income = parseFloat(row.total.toString());
        } else {
          acc[key].expense = parseFloat(row.total.toString());
        }

        return acc;
      }, {} as Record<string, { month: string; income: number; expense: number }>);

      return Object.values(monthlyData);
    }),

  getCategoryBreakdown: t.procedure
    .input(z.object({ months: z.number().optional().default(6) }).optional())
    .query(async ({ input, ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const months = input?.months ?? 6;
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - (months - 1));
      monthsAgo.setDate(1);
      monthsAgo.setHours(0, 0, 0, 0);

      const result = await db
        .select({
          categoryId: expense.categoryId,
          categoryName: category.name,
          categoryColor: category.color,
          total: sql<number>`CAST(SUM(${expense.amount}) AS NUMERIC)`,
        })
        .from(expense)
        .leftJoin(category, eq(expense.categoryId, category.id))
        .where(and(eq(expense.userId, ctx.session.user.id), eq(expense.type, "expense"), gte(expense.date, monthsAgo)))
        .groupBy(expense.categoryId, category.name, category.color)
        .orderBy(desc(sql`SUM(${expense.amount})`));

      return result.map((row) => ({
        categoryId: row.categoryId || "uncategorized",
        category: {
          name: row.categoryName || "Uncategorized",
          color: row.categoryColor || "#94a3b8",
        },
        total: parseFloat(row.total.toString()),
      }));
    }),
});

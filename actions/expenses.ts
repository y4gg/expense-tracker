"use server";

import { headers } from "next/headers";
import { db } from "@/db";
import { category, expense } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq, and, desc, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export async function getCategories() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return [];
  }

  const categories = await db
    .select()
    .from(category)
    .where(eq(category.userId, session.user.id))
    .orderBy(category.createdAt);

  return categories;
}

export async function createCategory(data: { name: string; color: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const newCategory = await db.insert(category).values({
    id: nanoid(),
    name: data.name,
    color: data.color,
    userId: session.user.id,
  });

  return newCategory;
}

export async function deleteCategory(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await db
    .select()
    .from(category)
    .where(and(eq(category.id, id), eq(category.userId, session.user.id)))
    .limit(1);

  if (!existing.length) {
    throw new Error("Category not found");
  }

  await db.delete(category).where(eq(category.id, id));

  return { success: true };
}

export async function getExpenses(categoryId?: string, type?: "expense" | "income") {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return [];
  }

  const conditions = [eq(expense.userId, session.user.id)];

  if (categoryId) {
    conditions.push(eq(expense.categoryId, categoryId));
  }

  if (type) {
    conditions.push(eq(expense.type, type));
  }

  const expenses = await db
    .select({
      id: expense.id,
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
      categoryId: expense.categoryId,
      type: expense.type,
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

  return expenses;
}

export async function createExpense(data: {
  amount: number;
  description: string;
  date: Date;
  categoryId?: string;
  type?: "expense" | "income";
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const newExpense = await db.insert(expense).values({
    id: nanoid(),
    amount: data.amount.toString(),
    description: data.description,
    date: data.date,
    categoryId: data.categoryId || null,
    type: data.type || "expense",
    userId: session.user.id,
  });

  return newExpense;
}

export async function updateExpense(id: string, data: {
  amount: number;
  description: string;
  date: Date;
  categoryId?: string;
  type?: "expense" | "income";
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await db
    .select()
    .from(expense)
    .where(and(eq(expense.id, id), eq(expense.userId, session.user.id)))
    .limit(1);

  if (!existing.length) {
    throw new Error("Expense not found");
  }

  await db
    .update(expense)
    .set({
      amount: data.amount.toString(),
      description: data.description,
      date: data.date,
      categoryId: data.categoryId || null,
      type: data.type || existing[0].type,
    })
    .where(eq(expense.id, id));

  return { success: true };
}

export async function deleteExpense(id: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Unauthorized");
  }

  const existing = await db
    .select()
    .from(expense)
    .where(and(eq(expense.id, id), eq(expense.userId, session.user.id)))
    .limit(1);

  if (!existing.length) {
    throw new Error("Expense not found");
  }

  await db.delete(expense).where(eq(expense.id, id));

  return { success: true };
}

export async function getFinancialSummary() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
    };
  }

  const result = await db
    .select({
      type: expense.type,
      total: sql<number>`CAST(SUM(CAST(${expense.amount} AS NUMERIC)) AS NUMERIC)`,
    })
    .from(expense)
    .where(eq(expense.userId, session.user.id))
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
}

import { NextResponse } from "next/server";
import { db } from "@/db";
import { expense, recurringTransaction } from "@/db/schema";
import { eq, and, lt } from "drizzle-orm";

export async function GET() {
  try {
    const now = new Date();

    const dueRecurringTransactions = await db
      .select()
      .from(recurringTransaction)
      .where(and(
        eq(recurringTransaction.userId, "demo"),
        eq(recurringTransaction.isActive, true),
        lt(recurringTransaction.nextDueDate, now),
      ))
      .orderBy(recurringTransaction.nextDueDate);

    let createdCount = 0;

    for (const recurring of dueRecurringTransactions) {
      const { frequency } = recurring;
      let nextDueDate = new Date(recurring.nextDueDate);

      switch (frequency) {
        case "daily":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case "every3days":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 3);
          break;
        case "weekly":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case "biweekly":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setDate(nextDueDate.getDate() + 14);
          break;
        case "monthly":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
        case "quarterly":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setMonth(nextDueDate.getMonth() + 3);
          break;
        case "yearly":
          nextDueDate = new Date(nextDueDate);
          nextDueDate.setFullYear(nextDueDate.getFullYear() + 1);
          break;
      }

      await db.insert(expense).values({
        id: `exp_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        amount: recurring.amount.toString(),
        description: recurring.description,
        date: nextDueDate,
        categoryId: recurring.categoryId,
        type: recurring.type,
        recurringTransactionId: recurring.id,
        userId: "demo",
      });

      await db.update(recurringTransaction)
        .set({
          nextDueDate: nextDueDate,
          lastTriggeredDate: now,
        })
        .where(eq(recurringTransaction.id, recurring.id));

      createdCount++;
    }

    return NextResponse.json({
      success: true,
      createdCount,
      message: `Created ${createdCount} recurring expenses`,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db";
import { savingsGoal } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";

export const goalsRouter = t.router({
  getAll: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const goals = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.userId, ctx.session.user.id), eq(savingsGoal.isActive, true)))
        .orderBy(sql`CASE WHEN ${savingsGoal.currentAmount} >= ${savingsGoal.targetAmount} THEN 1 ELSE 0 END ASC, ${savingsGoal.targetDate}`);

      return goals.map((goal) => ({
        ...goal,
        targetAmount: parseFloat(goal.targetAmount.toString()),
        currentAmount: parseFloat(goal.currentAmount.toString()),
        percentage: (parseFloat(goal.currentAmount.toString()) / parseFloat(goal.targetAmount.toString())) * 100,
        remaining: parseFloat(goal.targetAmount.toString()) - parseFloat(goal.currentAmount.toString()),
      }));
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

      const goal = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.id, input.id), eq(savingsGoal.userId, ctx.session.user.id)))
        .limit(1);

      if (!goal.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }

      const goalData = goal[0];

      return {
        ...goalData,
        targetAmount: parseFloat(goalData.targetAmount.toString()),
        currentAmount: parseFloat(goalData.currentAmount.toString()),
        percentage: (parseFloat(goalData.currentAmount.toString()) / parseFloat(goalData.targetAmount.toString())) * 100,
        remaining: parseFloat(goalData.targetAmount.toString()) - parseFloat(goalData.currentAmount.toString()),
      };
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        targetAmount: z.number().positive(),
        targetDate: z.date(),
        icon: z.string().default("Target"),
        color: z.string().default("#6366f1"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a savings goal",
        });
      }

      await db.insert(savingsGoal).values({
        id: nanoid(),
        name: input.name,
        targetAmount: input.targetAmount.toString(),
        currentAmount: "0",
        targetDate: input.targetDate,
        icon: input.icon,
        color: input.color,
        userId: ctx.session.user.id,
      });

      return { success: true };
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        targetAmount: z.number().positive().optional(),
        targetDate: z.date().optional(),
        icon: z.string().optional(),
        color: z.string().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a savings goal",
        });
      }

      const existing = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.id, input.id), eq(savingsGoal.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }

      const updateData: Record<string, string | boolean | Date> = {};

      if (input.name) updateData.name = input.name;
      if (input.targetAmount) updateData.targetAmount = input.targetAmount.toString();
      if (input.targetDate) updateData.targetDate = input.targetDate;
      if (input.icon) updateData.icon = input.icon;
      if (input.color) updateData.color = input.color;
      if (input.isActive !== undefined) updateData.isActive = input.isActive;

      await db
        .update(savingsGoal)
        .set(updateData)
        .where(eq(savingsGoal.id, input.id));

      return { success: true };
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a savings goal",
        });
      }

      const existing = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.id, input.id), eq(savingsGoal.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }

      await db.delete(savingsGoal).where(eq(savingsGoal.id, input.id));

      return { success: true };
    }),

  addFunds: t.procedure
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
          message: "You must be logged in to add funds to a goal",
        });
      }

      const existing = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.id, input.id), eq(savingsGoal.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Goal not found",
        });
      }

      const goal = existing[0];
      const currentAmount = parseFloat(goal.currentAmount.toString());
      const newAmount = currentAmount + input.amount;

      await db
        .update(savingsGoal)
        .set({ currentAmount: newAmount.toString() })
        .where(eq(savingsGoal.id, input.id));

      return { success: true, newAmount };
    }),

  getSummary: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return {
          totalGoals: 0,
          completedGoals: 0,
          totalSaved: 0,
          totalTarget: 0,
        };
      }

      const goals = await db
        .select()
        .from(savingsGoal)
        .where(and(eq(savingsGoal.userId, ctx.session.user.id), eq(savingsGoal.isActive, true)));

      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => parseFloat(g.currentAmount.toString()) >= parseFloat(g.targetAmount.toString())).length;
      const totalSaved = goals.reduce((sum, g) => sum + parseFloat(g.currentAmount.toString()), 0);
      const totalTarget = goals.reduce((sum, g) => sum + parseFloat(g.targetAmount.toString()), 0);

      return {
        totalGoals,
        completedGoals,
        totalSaved,
        totalTarget,
      };
    }),
});

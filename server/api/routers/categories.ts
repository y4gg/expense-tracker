import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db";
import { category } from "@/db/schema";
import { nanoid } from "nanoid";
import { t } from "../trpc";

export const categoriesRouter = t.router({
  getAll: t.procedure
    .query(async ({ ctx }) => {
      if (!ctx.session) {
        return [];
      }

      const categories = await db
        .select()
        .from(category)
        .where(eq(category.userId, ctx.session.user.id))
        .orderBy(category.createdAt);

      return categories;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        color: z.string().min(1).max(50),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a category",
        });
      }

      const newCategory = await db.insert(category).values({
        id: nanoid(),
        name: input.name,
        color: input.color,
        userId: ctx.session.user.id,
      });

      return newCategory;
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.session) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a category",
        });
      }

      const existing = await db
        .select()
        .from(category)
        .where(and(eq(category.id, input.id), eq(category.userId, ctx.session.user.id)))
        .limit(1);

      if (!existing.length) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Category not found",
        });
      }

      await db.delete(category).where(eq(category.id, input.id));

      return { success: true };
    }),
});

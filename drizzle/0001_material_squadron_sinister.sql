CREATE TYPE "public"."transaction_type" AS ENUM('expense', 'income');--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "type" "transaction_type" DEFAULT 'expense' NOT NULL;--> statement-breakpoint
CREATE INDEX "expense_type_idx" ON "expense" USING btree ("type");
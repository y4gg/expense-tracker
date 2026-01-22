ALTER TABLE "recurring_transaction" ALTER COLUMN "frequency" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."frequency_type";--> statement-breakpoint
CREATE TYPE "public"."frequency_type" AS ENUM('daily', 'every3days', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');--> statement-breakpoint
ALTER TABLE "recurring_transaction" ALTER COLUMN "frequency" SET DATA TYPE "public"."frequency_type" USING "frequency"::"public"."frequency_type";--> statement-breakpoint
ALTER TABLE "recurring_transaction" DROP COLUMN "custom_days";
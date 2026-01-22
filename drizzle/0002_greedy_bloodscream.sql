CREATE TYPE "public"."frequency_type" AS ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom');--> statement-breakpoint
CREATE TABLE "recurring_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text NOT NULL,
	"category_id" text,
	"type" "transaction_type" DEFAULT 'expense' NOT NULL,
	"frequency" "frequency_type" NOT NULL,
	"custom_days" text,
	"next_due_date" timestamp NOT NULL,
	"last_triggered_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "expense" ADD COLUMN "recurring_transaction_id" text;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ADD CONSTRAINT "recurring_transaction_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_transaction" ADD CONSTRAINT "recurring_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recurring_transaction_userId_idx" ON "recurring_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recurring_transaction_nextDueDate_idx" ON "recurring_transaction" USING btree ("next_due_date");--> statement-breakpoint
CREATE INDEX "recurring_transaction_isActive_idx" ON "recurring_transaction" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "expense" ADD CONSTRAINT "expense_recurring_transaction_id_recurring_transaction_id_fk" FOREIGN KEY ("recurring_transaction_id") REFERENCES "public"."recurring_transaction"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "expense_recurringTransactionId_idx" ON "expense" USING btree ("recurring_transaction_id");
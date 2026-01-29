CREATE TABLE "budget" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text,
	"amount" numeric(10, 2) NOT NULL,
	"month" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "savings_goal" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"target_amount" numeric(10, 2) NOT NULL,
	"current_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"target_date" timestamp NOT NULL,
	"icon" text DEFAULT 'Target' NOT NULL,
	"color" text DEFAULT '#6366f1' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "savings_goal" ADD CONSTRAINT "savings_goal_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "budget_userId_idx" ON "budget" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "budget_categoryId_idx" ON "budget" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "budget_month_idx" ON "budget" USING btree ("month");--> statement-breakpoint
CREATE INDEX "savings_goal_userId_idx" ON "savings_goal" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "savings_goal_isActive_idx" ON "savings_goal" USING btree ("is_active");
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, index, numeric, pgEnum } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const transactionType = pgEnum("transaction_type", ["expense", "income"]);

export const frequencyType = pgEnum("frequency_type", ["daily", "every3days", "weekly", "biweekly", "monthly", "quarterly", "yearly"]);

export const category = pgTable(
  "category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    color: text("color").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("category_userId_idx").on(table.userId)],
);

export const recurringTransaction = pgTable(
  "recurring_transaction",
  {
    id: text("id").primaryKey(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
    type: transactionType("type").notNull().default("expense"),
    frequency: frequencyType("frequency").notNull(),
    nextDueDate: timestamp("next_due_date").notNull(),
    lastTriggeredDate: timestamp("last_triggered_date"),
    isActive: boolean("is_active").notNull().default(true),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("recurring_transaction_userId_idx").on(table.userId),
    index("recurring_transaction_nextDueDate_idx").on(table.nextDueDate),
    index("recurring_transaction_isActive_idx").on(table.isActive),
  ],
);

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    description: text("description").notNull(),
    date: timestamp("date").notNull(),
    categoryId: text("category_id").references(() => category.id, { onDelete: "set null" }),
    type: transactionType("type").notNull().default("expense"),
    recurringTransactionId: text("recurring_transaction_id").references(() => recurringTransaction.id, { onDelete: "set null" }),
    receiptFile: text("receipt_file"),
    receiptUrl: text("receipt_url"),
    receiptFileName: text("receipt_file_name"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("expense_userId_idx").on(table.userId),
    index("expense_categoryId_idx").on(table.categoryId),
    index("expense_type_idx").on(table.type),
    index("expense_recurringTransactionId_idx").on(table.recurringTransactionId),
  ],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  categories: many(category),
  expenses: many(expense),
  recurringTransactions: many(recurringTransaction),
  budgets: many(budget),
  savingsGoals: many(savingsGoal),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const categoryRelations = relations(category, ({ one, many }) => ({
  user: one(user, {
    fields: [category.userId],
    references: [user.id],
  }),
  expenses: many(expense),
  recurringTransactions: many(recurringTransaction),
  budgets: many(budget),
}));

export const recurringTransactionRelations = relations(recurringTransaction, ({ one, many }) => ({
  user: one(user, {
    fields: [recurringTransaction.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [recurringTransaction.categoryId],
    references: [category.id],
  }),
  expenses: many(expense),
}));

export const budget = pgTable(
  "budget",
  {
    id: text("id").primaryKey(),
    categoryId: text("category_id").references(() => category.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("budget_userId_idx").on(table.userId),
    index("budget_categoryId_idx").on(table.categoryId),
  ],
);

export const savingsGoal = pgTable(
  "savings_goal",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
    currentAmount: numeric("current_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    targetDate: timestamp("target_date").notNull(),
    icon: text("icon").notNull().default("Target"),
    color: text("color").notNull().default("#6366f1"),
    isActive: boolean("is_active").notNull().default(true),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index("savings_goal_userId_idx").on(table.userId),
    index("savings_goal_isActive_idx").on(table.isActive),
  ],
);

export const expenseRelations = relations(expense, ({ one }) => ({
  user: one(user, {
    fields: [expense.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [expense.categoryId],
    references: [category.id],
  }),
  recurringTransaction: one(recurringTransaction, {
    fields: [expense.recurringTransactionId],
    references: [recurringTransaction.id],
  }),
}));

export const budgetRelations = relations(budget, ({ one }) => ({
  user: one(user, {
    fields: [budget.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [budget.categoryId],
    references: [category.id],
  }),
}));

export const savingsGoalRelations = relations(savingsGoal, ({ one }) => ({
  user: one(user, {
    fields: [savingsGoal.userId],
    references: [user.id],
  }),
}));

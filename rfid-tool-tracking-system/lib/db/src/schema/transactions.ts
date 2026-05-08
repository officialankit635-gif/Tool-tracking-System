import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { toolsTable } from "./tools";
import { usersTable } from "./users";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").notNull().references(() => toolsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  actionType: text("action_type").notNull(),
  issueDate: timestamp("issue_date", { withTimezone: true }).notNull().defaultNow(),
  returnDate: timestamp("return_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTransactionSchema = createInsertSchema(transactionsTable).omit({ id: true, createdAt: true });
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactionsTable.$inferSelect;

import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, toolsTable, transactionsTable, usersTable } from "@workspace/db";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/stats", requireAuth, async (req, res): Promise<void> => {
  const allTools = await db.select().from(toolsTable);

  const totalTools = allTools.length;
  const availableTools = allTools.filter((t) => t.status === "available").length;
  const issuedTools = allTools.filter((t) => t.status === "issued").length;
  const missingTools = allTools.filter((t) => t.status === "missing").length;

  const allTransactions = await db
    .select({
      id: transactionsTable.id,
      toolId: transactionsTable.toolId,
      userId: transactionsTable.userId,
      actionType: transactionsTable.actionType,
      issueDate: transactionsTable.issueDate,
      returnDate: transactionsTable.returnDate,
      createdAt: transactionsTable.createdAt,
      toolName: toolsTable.name,
      toolIdentifier: toolsTable.toolId,
      userName: usersTable.name,
    })
    .from(transactionsTable)
    .innerJoin(toolsTable, eq(transactionsTable.toolId, toolsTable.id))
    .innerJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
    .orderBy(transactionsTable.createdAt);

  const totalTransactions = allTransactions.length;
  const recentTransactions = allTransactions.slice(-10).reverse();

  const categoryMap = new Map<string, number>();
  for (const tool of allTools) {
    categoryMap.set(tool.category, (categoryMap.get(tool.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  res.json({
    totalTools,
    availableTools,
    issuedTools,
    missingTools,
    totalTransactions,
    recentTransactions,
    categoryBreakdown,
  });
});

export default router;

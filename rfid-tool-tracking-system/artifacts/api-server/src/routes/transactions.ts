import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, toolsTable, transactionsTable, usersTable } from "@workspace/db";
import { IssueToolBody, ReturnToolBody, ListTransactionsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/issue", requireAuth, async (req, res): Promise<void> => {
  const parsed = IssueToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId, userId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: `Tool "${toolId}" not found` });
    return;
  }

  if (tool.status !== "available") {
    res.status(400).json({ error: `Tool "${toolId}" is not available (current status: ${tool.status})` });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(404).json({ error: `User with ID ${userId} not found` });
    return;
  }

  await db.update(toolsTable).set({ status: "issued" }).where(eq(toolsTable.id, tool.id));

  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      toolId: tool.id,
      userId: userId,
      actionType: "issue",
      issueDate: new Date(),
    })
    .returning();

  res.status(201).json(transaction);
});

router.post("/return", requireAuth, async (req, res): Promise<void> => {
  const parsed = ReturnToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { toolId } = parsed.data;

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, toolId));
  if (!tool) {
    res.status(404).json({ error: `Tool "${toolId}" not found` });
    return;
  }

  if (tool.status !== "issued") {
    res.status(400).json({ error: `Tool "${toolId}" is not currently issued (status: ${tool.status})` });
    return;
  }

  await db.update(toolsTable).set({ status: "available" }).where(eq(toolsTable.id, tool.id));

  const [transaction] = await db
    .insert(transactionsTable)
    .values({
      toolId: tool.id,
      userId: req.userId!,
      actionType: "return",
      issueDate: new Date(),
      returnDate: new Date(),
    })
    .returning();

  res.json(transaction);
});

router.get("/transactions", requireAuth, async (req, res): Promise<void> => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const rows = await db
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

  let result = rows;
  if (query.data.actionType) {
    result = result.filter((r) => r.actionType === query.data.actionType);
  }
  if (query.data.toolId) {
    result = result.filter((r) => r.toolId === query.data.toolId);
  }

  res.json(result);
});

export default router;

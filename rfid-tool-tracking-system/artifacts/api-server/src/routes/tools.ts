import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, toolsTable } from "@workspace/db";
import {
  CreateToolBody,
  UpdateToolBody,
  GetToolParams,
  UpdateToolParams,
  DeleteToolParams,
  ListToolsQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/tools", requireAuth, async (req, res): Promise<void> => {
  const query = ListToolsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let tools = await db.select().from(toolsTable).orderBy(toolsTable.createdAt);

  if (query.data.status) {
    tools = tools.filter((t) => t.status === query.data.status);
  }
  if (query.data.category) {
    tools = tools.filter((t) => t.category === query.data.category);
  }

  res.json(tools);
});

router.post("/tools", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(toolsTable).where(eq(toolsTable.toolId, parsed.data.toolId));
  if (existing) {
    res.status(409).json({ error: `Tool ID "${parsed.data.toolId}" already exists` });
    return;
  }

  const [tool] = await db
    .insert(toolsTable)
    .values({
      toolId: parsed.data.toolId,
      name: parsed.data.name,
      category: parsed.data.category,
      status: parsed.data.status ?? "available",
    })
    .returning();

  res.status(201).json(tool);
});

router.get("/tools/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db.select().from(toolsTable).where(eq(toolsTable.id, params.data.id));
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(tool);
});

router.put("/tools/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateToolBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = {};
  if (parsed.data.toolId !== undefined) updateData.toolId = parsed.data.toolId;
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.category !== undefined) updateData.category = parsed.data.category;
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;

  const [tool] = await db
    .update(toolsTable)
    .set(updateData)
    .where(eq(toolsTable.id, params.data.id))
    .returning();

  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.json(tool);
});

router.delete("/tools/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteToolParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [tool] = await db.delete(toolsTable).where(eq(toolsTable.id, params.data.id)).returning();
  if (!tool) {
    res.status(404).json({ error: "Tool not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;

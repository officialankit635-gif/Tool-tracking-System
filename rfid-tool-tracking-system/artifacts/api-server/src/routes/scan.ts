import { Router, type IRouter } from "express";
import { db, toolsTable } from "@workspace/db";
import { InventoryScanBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.post("/scan", requireAuth, async (req, res): Promise<void> => {
  const parsed = InventoryScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { scannedTools } = parsed.data;

  const allTools = await db.select().from(toolsTable);
  const allToolIds = allTools.map((t) => t.toolId);
  const scannedSet = new Set(scannedTools);
  const allSet = new Set(allToolIds);

  const correctTools = scannedTools.filter((id) => allSet.has(id));
  const missingTools = allToolIds.filter((id) => !scannedSet.has(id));
  const extraTools = scannedTools.filter((id) => !allSet.has(id));

  res.json({
    correctTools,
    missingTools,
    extraTools,
    summary: {
      total: allToolIds.length,
      correct: correctTools.length,
      missing: missingTools.length,
      extra: extraTools.length,
    },
  });
});

export default router;

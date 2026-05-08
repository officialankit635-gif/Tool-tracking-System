import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import toolsRouter from "./tools";
import transactionsRouter from "./transactions";
import scanRouter from "./scan";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(toolsRouter);
router.use(transactionsRouter);
router.use(scanRouter);
router.use(statsRouter);

export default router;

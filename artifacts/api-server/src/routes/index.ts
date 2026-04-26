import { Router, type IRouter } from "express";
import healthRouter from "./health";
import blueprintsRouter from "./blueprints";

const router: IRouter = Router();

router.use(healthRouter);
router.use(blueprintsRouter);

export default router;

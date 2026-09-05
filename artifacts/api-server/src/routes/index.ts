import { Router, type IRouter } from "express";
import healthRouter from "./health";
import keetaRouter from "./keeta";

const router: IRouter = Router();

router.use(healthRouter);
router.use(keetaRouter);

export default router;

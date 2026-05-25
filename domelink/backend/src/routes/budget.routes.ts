import { Router } from "express";
import { budgetRealityCheck } from "../controllers/budget.controller.js";

const router = Router();

router.post("/reality-check", budgetRealityCheck);

export default router;

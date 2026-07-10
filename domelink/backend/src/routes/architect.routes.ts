import { Router } from "express";
import { getArchitects, getArchitectBySlug, getMyArchitect, getMyArchitectStats, getMyArchitectInsights } from "../controllers/architect.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", getArchitects);
router.get("/me", requireAuth, getMyArchitect);
router.get("/me/stats", requireAuth, getMyArchitectStats);
router.get("/me/insights", requireAuth, getMyArchitectInsights);
router.get("/:slug", getArchitectBySlug);

export default router;

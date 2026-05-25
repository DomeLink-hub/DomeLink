import { Router } from "express";
import { getArchitects, getArchitectBySlug, getMyArchitect, getMyArchitectStats } from "../controllers/architect.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.get("/", getArchitects);
router.get("/:slug", getArchitectBySlug);
router.get("/me", requireAuth, getMyArchitect);
router.get("/me/stats", requireAuth, getMyArchitectStats);

export default router;
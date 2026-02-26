import { Router } from "express";
import {
  createArchitect,
  getArchitectBySlug,
  getMyArchitect,
  getMyArchitectStats,
  listArchitects,
  updateArchitect,
} from "../controllers/architect.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const architectRouter = Router();

architectRouter.get("/", listArchitects);
architectRouter.get("/me", requireAuth, requireRole(["architect", "admin"]), getMyArchitect);
architectRouter.get("/me/stats", requireAuth, requireRole(["architect", "admin"]), getMyArchitectStats);
architectRouter.get("/:slug", getArchitectBySlug);
architectRouter.post("/", requireAuth, requireRole(["architect", "admin"]), createArchitect);
architectRouter.patch("/:id", requireAuth, requireRole(["architect", "admin"]), updateArchitect);

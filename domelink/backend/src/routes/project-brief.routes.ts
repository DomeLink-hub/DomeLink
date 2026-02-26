import { Router } from "express";
import {
  createProjectBrief,
  getMyProjectBriefs,
  updateProjectBrief,
} from "../controllers/project-brief.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const projectBriefRouter = Router();

projectBriefRouter.get("/my", requireAuth, requireRole(["homeowner", "admin"]), getMyProjectBriefs);
projectBriefRouter.post("/", requireAuth, requireRole(["homeowner", "admin"]), createProjectBrief);
projectBriefRouter.patch("/:briefId", requireAuth, requireRole(["homeowner", "admin"]), updateProjectBrief);

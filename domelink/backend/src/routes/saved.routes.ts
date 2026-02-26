import { Router } from "express";
import { getSavedArchitects, saveArchitect, unsaveArchitect } from "../controllers/saved.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const savedRouter = Router();

savedRouter.get("/my", requireAuth, requireRole(["homeowner", "admin"]), getSavedArchitects);
savedRouter.post("/", requireAuth, requireRole(["homeowner", "admin"]), saveArchitect);
savedRouter.delete("/:architectId", requireAuth, requireRole(["homeowner", "admin"]), unsaveArchitect);

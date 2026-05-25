import { Router } from "express";
import { getMySavers, getSavedArchitects, saveArchitect, startConversationWithSaver, unsaveArchitect } from "../controllers/saved.controller.js";
import { authenticate as requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

export const savedRouter = Router();

savedRouter.get("/my", requireAuth, requireRole("homeowner"), getSavedArchitects);
savedRouter.get("/my-savers", requireAuth, requireRole("architect"), getMySavers);
savedRouter.post("/my-savers/:userId/conversation", requireAuth, requireRole("architect"), startConversationWithSaver);
savedRouter.post("/", requireAuth, requireRole("homeowner"), saveArchitect);
savedRouter.delete("/:architectId", requireAuth, requireRole("homeowner"), unsaveArchitect);

import { Router } from "express";
import {
  getAdminOverview,
  listArchitectsAdmin,
  listUsersAdmin,
  updateArchitectModerationAdmin,
  updateUserStatusAdmin,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["admin"]));

adminRouter.get("/overview", getAdminOverview);
adminRouter.get("/users", listUsersAdmin);
adminRouter.patch("/users/:userId/status", updateUserStatusAdmin);
adminRouter.get("/architects", listArchitectsAdmin);
adminRouter.patch("/architects/:architectId/moderation", updateArchitectModerationAdmin);

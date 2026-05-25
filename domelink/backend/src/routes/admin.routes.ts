import { Router } from "express";
import {
  getAdminOverview,
  getBillingModerationAdmin,
  listArchitectsAdmin,
  listUsersAdmin,
  manageFeaturedArchitectAdmin,
  moderateUploadAdmin,
  updateArchitectModerationAdmin,
  updateUserStatusAdmin,
  listWebhooksAdmin,
  getWebhookAdmin,
  listWebhookReplaysAdmin,
  replayWebhookAdmin,
} from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole(["admin"]));

adminRouter.get("/overview", getAdminOverview);
adminRouter.get("/users", listUsersAdmin);
adminRouter.patch("/users/:userId/status", updateUserStatusAdmin);
adminRouter.get("/architects", listArchitectsAdmin);
adminRouter.patch("/architects/:architectId/moderation", updateArchitectModerationAdmin);
adminRouter.get("/billing", getBillingModerationAdmin);
adminRouter.patch("/uploads/:assetId", moderateUploadAdmin);
adminRouter.patch("/featured/:placementId", manageFeaturedArchitectAdmin);
adminRouter.get("/webhooks", listWebhooksAdmin);
adminRouter.get("/webhooks/:webhookId", getWebhookAdmin);
adminRouter.post("/webhooks/:webhookId/replay", replayWebhookAdmin);
adminRouter.get("/webhooks/:webhookId/replays", listWebhookReplaysAdmin);

export default adminRouter;

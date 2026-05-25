import { Router } from "express";
import { getNotificationCount, getNotifications, markNotificationRead } from "../controllers/notification.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/my", requireAuth, getNotifications);
router.get("/count", requireAuth, getNotificationCount);
router.patch("/:notificationId/read", requireAuth, markNotificationRead);

export default router;

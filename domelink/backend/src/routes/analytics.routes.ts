import { Router } from "express";
import { getAnalytics, getAnalyticsSummary, trackEvent } from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const analyticsRouter = Router();

analyticsRouter.post("/", requireAuth, trackEvent);
analyticsRouter.get("/summary", requireAuth, getAnalyticsSummary);
analyticsRouter.get("/", requireAuth, requireRole(["admin"]), getAnalytics);

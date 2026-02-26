import { Router } from "express";
import { getHomeownerRecommendations, getRecommendations } from "../controllers/recommendation.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const recommendationRouter = Router();

recommendationRouter.get("/", requireAuth, requireRole(["homeowner", "admin"]), getRecommendations);
recommendationRouter.get("/homeowner", requireAuth, requireRole(["homeowner", "admin"]), getHomeownerRecommendations);

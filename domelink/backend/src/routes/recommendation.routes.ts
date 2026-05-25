import { Router } from "express";
import { getHomeownerRecommendations, getRecommendations } from "../controllers/recommendation.controller.js";
import { authenticate as requireAuth } from "../middleware/auth.js";

export const recommendationRouter = Router();

recommendationRouter.get("/", requireAuth, getRecommendations);
recommendationRouter.get("/homeowner", requireAuth, getHomeownerRecommendations);

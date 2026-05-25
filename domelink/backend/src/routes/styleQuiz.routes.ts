import { Router } from "express";
import { getStyleRecommendations } from "../controllers/styleQuiz.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const styleQuizRouter = Router();

styleQuizRouter.get("/recommendations/style", requireAuth, requireRole(["homeowner", "admin"]), getStyleRecommendations);

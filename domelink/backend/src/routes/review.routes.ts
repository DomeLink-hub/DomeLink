import { Router } from "express";
import { getReviewsForArchitect, createReview } from "../controllers/review.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const reviewRouter = Router();

reviewRouter.get("/architect/:architectId", requireAuth, getReviewsForArchitect);
reviewRouter.post("/architect/:architectId", requireAuth, requireRole(["homeowner", "admin"]), createReview);

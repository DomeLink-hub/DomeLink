import { Router } from "express";
import { getReviewsForArchitect, createReview } from "../controllers/review.controller.js";
import { authenticate as requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

import { ReviewModel } from "../models/Review.js";

export const reviewRouter = Router();
// Get reviews for current user
reviewRouter.get("/my", requireAuth, async (req, res) => {
	const userId = req.user?.id;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });
	const reviews = await ReviewModel.find({ reviewer: userId }).populate("reviewee", "name");
	res.status(200).json(reviews);
});

reviewRouter.get("/:architectId", getReviewsForArchitect);
reviewRouter.post("/architect/:architectId", requireAuth, requireRole("homeowner"), createReview);

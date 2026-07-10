import { Router } from "express";
import { getReviewsForArchitect, createReview } from "../controllers/review.controller.js";
import { authenticate as requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";

export const reviewRouter = Router();

// Get reviews written by the current user
reviewRouter.get("/my", requireAuth, async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const reviews = await prisma.review.findMany({
    where: { reviewerId: userId },
    include: { reviewee: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(
    reviews.map((r) => ({
      _id: r.id, id: r.id, project: r.projectId,
      reviewer: r.reviewerId,
      reviewee: { _id: r.reviewee.id, name: r.reviewee.name },
      rating: r.rating, comment: r.comment, createdAt: r.createdAt,
    })),
  );
});

reviewRouter.get("/:architectId", getReviewsForArchitect);
reviewRouter.post("/architect/:architectId", requireAuth, requireRole("homeowner"), createReview);

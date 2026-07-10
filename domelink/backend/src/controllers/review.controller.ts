import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getReviewsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;

  const reviews = await prisma.review.findMany({
    where: { revieweeId: architectId },
    include: {
      reviewer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Shape matches old Mongo response (reviewer populated with name)
  res.status(200).json(
    reviews.map((r) => ({
      _id: r.id,
      id: r.id,
      project: r.projectId,
      reviewer: { _id: r.reviewer.id, name: r.reviewer.name },
      reviewee: r.revieweeId,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
    })),
  );
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { rating, comment, project } = req.body;
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const review = await prisma.review.create({
    data: {
      reviewerId: req.user.id,
      revieweeId: architectId,
      rating: Number(rating),
      comment: comment || "",
      projectId: project || null,
    },
    include: {
      reviewer: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    _id: review.id,
    id: review.id,
    project: review.projectId,
    reviewer: { _id: review.reviewer.id, name: review.reviewer.name },
    reviewee: review.revieweeId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
  });
});

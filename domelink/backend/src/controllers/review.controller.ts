import type { Request, Response } from "express";
import { ReviewModel } from "../models/Review.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getReviewsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const reviews = await ReviewModel.find({ reviewee: architectId }).populate("reviewer", "name");
  res.status(200).json(reviews);
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { rating, comment, project } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const review = await ReviewModel.create({
    project,
    reviewer: req.auth.sub,
    reviewee: architectId,
    rating,
    comment,
    createdAt: new Date(),
  });
  res.status(201).json(review);
});

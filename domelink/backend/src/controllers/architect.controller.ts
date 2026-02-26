import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { AnalyticsEventModel } from "../models/analytics-event.js";
import { ConsultationModel } from "../models/Consultation.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const upsertArchitectSchema = z.object({
  slug: z.string().min(2),
  name: z.string().min(2),
  location: z.string().min(2),
  specialty: z.string().min(2),
  rating: z.number().min(0).max(5),
  startingPrice: z.number().nonnegative(),
  about: z.string().min(10),
  heroImage: z.string().url(),
  profileImage: z.string().url(),
  experience: z.string().min(2),
  teamSize: z.number().int().positive(),
  projects: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        image: z.string().url(),
        location: z.string(),
        year: z.string(),
        area: z.string().optional(),
      }),
    )
    .default([]),
  templates: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        price: z.number().nonnegative(),
      }),
    )
    .default([]),
});

export const listArchitects = asyncHandler(async (req: Request, res: Response) => {
  const minRating = Number(req.query.minRating || 0);
  const minBudget = Number(req.query.minBudget || 0);
  const maxBudget = Number(req.query.maxBudget || Number.MAX_SAFE_INTEGER);

  const architects = await ArchitectModel.find({
    rating: { $gte: minRating },
    startingPrice: { $gte: minBudget, $lte: maxBudget },
  }).sort({ rating: -1, createdAt: -1 });

  res.status(200).json(architects);
});

export const getArchitectBySlug = asyncHandler(async (req: Request, res: Response) => {
  const architect = await ArchitectModel.findOne({ slug: req.params.slug });
  if (!architect) {
    throw new AppError("Architect not found", 404);
  }

  res.status(200).json(architect);
});

export const getMyArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const architect = await ArchitectModel.findOne({ createdBy: req.auth.sub }).sort({ createdAt: -1 });
  if (!architect) {
    throw new AppError("Architect profile not found", 404);
  }

  res.status(200).json(architect);
});

export const createArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = upsertArchitectSchema.parse(req.body);
  const architect = await ArchitectModel.create({
    ...payload,
    createdBy: req.auth.sub,
  });

  res.status(201).json(architect);
});

export const updateArchitect = asyncHandler(async (req: Request, res: Response) => {
  const payload = upsertArchitectSchema.partial().parse(req.body);

  const architect = await ArchitectModel.findByIdAndUpdate(req.params.id, payload, {
    new: true,
  });

  if (!architect) {
    throw new AppError("Architect not found", 404);
  }

  res.status(200).json(architect);
});

export const getMyArchitectStats = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const architectProfiles = await ArchitectModel.find({ createdBy: req.auth.sub }).select("_id");
  const architectIds = architectProfiles.map((architect) => architect._id);

  if (architectIds.length === 0) {
    res.status(200).json({
      totalRequests: 0,
      pendingRequests: 0,
      acceptedRequests: 0,
      closedRequests: 0,
      profileViews: 0,
      monthlyEarnings: 0,
      totalEarnings: 0,
      thisMonthRequests: 0,
    });
    return;
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalRequests,
    pendingRequests,
    acceptedRequests,
    closedRequests,
    thisMonthRequests,
    earningsByStatus,
    profileViews,
  ] = await Promise.all([
    ConsultationModel.countDocuments({ architectId: { $in: architectIds } }),
    ConsultationModel.countDocuments({ architectId: { $in: architectIds }, status: "pending" }),
    ConsultationModel.countDocuments({ architectId: { $in: architectIds }, status: "accepted" }),
    ConsultationModel.countDocuments({ architectId: { $in: architectIds }, status: { $in: ["closed", "completed"] } }),
    ConsultationModel.countDocuments({ architectId: { $in: architectIds }, createdAt: { $gte: startOfMonth } }),
    ConsultationModel.aggregate<{ _id: string; total: number }>([
      { $match: { architectId: { $in: architectIds }, status: { $in: ["accepted", "active", "closed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    AnalyticsEventModel.countDocuments({
      event: "profile_view",
      "metadata.architectId": { $in: architectIds.map((id) => String(id)) },
    }),
  ]);

  const monthlyEarnings = await ConsultationModel.aggregate<{ _id: string; total: number }>([
    {
      $match: {
        architectId: { $in: architectIds },
        createdAt: { $gte: startOfMonth },
        status: { $in: ["accepted", "active", "closed", "completed"] },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.status(200).json({
    totalRequests,
    pendingRequests,
    acceptedRequests,
    closedRequests,
    profileViews,
    monthlyEarnings: monthlyEarnings[0]?.total ?? 0,
    totalEarnings: earningsByStatus[0]?.total ?? 0,
    thisMonthRequests,
  });
});

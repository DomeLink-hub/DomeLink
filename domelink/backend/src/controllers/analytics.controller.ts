import type { Request, Response } from "express";
import { z } from "zod";
import { AnalyticsEventModel } from "../models/analytics-event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

const analyticsSchema = z.object({
  event: z.enum(["profile_view", "consultation_start", "save", "search_filter"]),
  metadata: z.record(z.any()).optional(),
});

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional(),
});

// NOTE: This is the Mongoose-backed AnalyticsEventModel (MongoDB).
// It is distinct from the Prisma analyticsEvent table written by analyticsService.track().
// Both legitimately exist — this one handles frontend-emitted events (profile views, etc.).
export const trackEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const payload = analyticsSchema.parse(req.body);

  try {
    const event = await AnalyticsEventModel.create({
      userId: req.auth.sub,
      event: payload.event,
      metadata: payload.metadata || {},
    });
    res.status(201).json(event);
  } catch (err: any) {
    logger.warn("MongoDB error in trackEvent", { error: err.message, userId: req.auth.sub });
    res.status(503).json({ error: "Analytics service temporarily unavailable" });
  }
});

import prisma from "../config/prisma.js";

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id || req.auth?.sub;
  if (!userId) throw new AppError("Unauthorized", 401);

  const query = analyticsQuerySchema.parse(req.query);

  const subscription = await prisma.subscription.findUnique({ where: { userId } });
  const tier = subscription?.tier || "FREE";

  let maxDays = 7;
  if (tier === "PRO") maxDays = 30;
  if (tier === "STUDIO") maxDays = 90;

  const requestedDays = query.days ?? maxDays;
  const days = Math.min(requestedDays, maxDays);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const events = await AnalyticsEventModel.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(300);
    res.status(200).json(events);
  } catch (err: any) {
    logger.warn("MongoDB error in getAnalytics", { error: err.message, userId });
    res.status(503).json({ error: "Analytics service temporarily unavailable" });
  }
});

export const getAnalyticsSummary = asyncHandler(async (_req: Request, res: Response) => {
  try {
    const [totals, byEvent, daily30, daily7] = await Promise.all([
      AnalyticsEventModel.countDocuments(),
      AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$event", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);
    res.status(200).json({ totals, byEvent, daily30, daily7 });
  } catch (err: any) {
    logger.warn("MongoDB error in getAnalyticsSummary", { error: err.message });
    res.status(503).json({ error: "Analytics service temporarily unavailable" });
  }
});

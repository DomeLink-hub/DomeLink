import type { Request, Response } from "express";
import { z } from "zod";
import { AnalyticsEventModel } from "../models/analytics-event.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const analyticsSchema = z.object({
  event: z.enum(["profile_view", "consultation_start", "save", "search_filter"]),
  metadata: z.record(z.any()).optional(),
});

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).optional(),
});

export const trackEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const payload = analyticsSchema.parse(req.body);

  const event = await AnalyticsEventModel.create({
    userId: req.auth.sub,
    event: payload.event,
    metadata: payload.metadata || {},
  });

  res.status(201).json(event);
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  const query = analyticsQuerySchema.parse(req.query);
  const days = query.days ?? 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const events = await AnalyticsEventModel.find({ createdAt: { $gte: since } }).sort({ createdAt: -1 }).limit(300);
  res.status(200).json(events);
});

export const getAnalyticsSummary = asyncHandler(async (_req: Request, res: Response) => {
  const [totals, byEvent, daily30, daily7] = await Promise.all([
    AnalyticsEventModel.countDocuments(),
    AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
      { $group: { _id: "$event", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    AnalyticsEventModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  res.status(200).json({
    totals,
    byEvent,
    daily30,
    daily7,
  });
});

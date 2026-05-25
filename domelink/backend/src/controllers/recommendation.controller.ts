import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ProjectBriefModel } from "../models/ProjectBrief.js";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();
import { rankArchitects } from "../utils/matchingEngine.js";
import { generateRecommendationReason } from "../services/ai/recommendationAI.service.js";

const parseBudgetRange = (input?: string) => {
  if (!input) return { min: undefined, max: undefined };
  const values = input
    .replace(/,/g, "")
    .match(/\d+/g)
    ?.map((value) => Number(value))
    .filter((value) => !Number.isNaN(value));

  if (!values || values.length === 0) {
    return { min: undefined, max: undefined };
  }
  if (values.length === 1) {
    return { min: values[0], max: undefined };
  }
  return { min: Math.min(...values), max: Math.max(...values) };
};

export const getRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const prefs = {
    budgetMin: req.query.budgetMin ? Number(req.query.budgetMin) : undefined,
    budgetMax: req.query.budgetMax ? Number(req.query.budgetMax) : undefined,
    plotSize: req.query.plotSize ? String(req.query.plotSize) : undefined,
    preferredStyle: req.query.style ? String(req.query.style) : undefined,
    location: req.query.location ? String(req.query.location) : undefined,
    city: req.query.city ? String(req.query.city) : undefined,
    projectType: req.query.projectType ? String(req.query.projectType) : undefined,
    requireVerified: req.query.verified === "true" ? true : undefined,
    preferFeatured: req.query.featured === "true" ? true : undefined,
  };

  const architects = await prisma.user.findMany({
    where: { role: 'ARCHITECT' },
    orderBy: { rating: 'desc' }
  });
  const saved = req.user?.id
    ? await SavedArchitectModel.find({ userId: req.user.id })
    : [];
  const consultations = req.user?.id
    ? await prisma.consultation.findMany({ where: { userId: req.user.id } })
    : [];

  const ranked = rankArchitects(architects, prefs, saved, consultations);
  const context = [
    prefs.city ? `City: ${prefs.city}` : null,
    prefs.location ? `Location: ${prefs.location}` : null,
    prefs.projectType ? `Project type: ${prefs.projectType}` : null,
    prefs.preferredStyle ? `Style: ${prefs.preferredStyle}` : null,
    prefs.budgetMin || prefs.budgetMax ? `Budget: ${prefs.budgetMin ?? ""}-${prefs.budgetMax ?? ""}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const enriched = await Promise.all(
    ranked.map(async (architect) => {
      const plainArchitect = typeof (architect as { toObject?: () => unknown }).toObject === "function"
        ? (architect as { toObject: () => Record<string, unknown> }).toObject()
        : (architect as unknown as Record<string, unknown>);

      const recommendationReason = await generateRecommendationReason(plainArchitect, context);

      return {
        ...plainArchitect,
        recommendationReason,
      };
    }),
  );

  res.status(200).json(enriched);
});

export const getHomeownerRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const homeownerId = req.user?.id;

  const latestBrief = homeownerId
    ? await ProjectBriefModel.findOne({ homeownerId }).sort({ updatedAt: -1 })
    : null;

  const budgetFromBrief = parseBudgetRange(latestBrief?.budget);

  const prefs = {
    budgetMin: req.query.budgetMin ? Number(req.query.budgetMin) : budgetFromBrief.min,
    budgetMax: req.query.budgetMax ? Number(req.query.budgetMax) : budgetFromBrief.max,
    plotSize: req.query.plotSize ? String(req.query.plotSize) : latestBrief?.plotSize,
    preferredStyle: req.query.style ? String(req.query.style) : latestBrief?.stylePreferences?.[0],
    location: req.query.location ? String(req.query.location) : latestBrief?.location,
    city: req.query.city ? String(req.query.city) : latestBrief?.location,
    projectType: req.query.projectType ? String(req.query.projectType) : latestBrief?.projectType,
    requireVerified: req.query.verified === "true" ? true : undefined,
    preferFeatured: req.query.featured === "true" ? true : undefined,
    // Avora-enhanced signals
    complexityScore: req.query.complexityScore ? Number(req.query.complexityScore) : undefined,
    interiorTier: req.query.interiorTier ? String(req.query.interiorTier) : undefined,
    architectTier: req.query.architectTier ? String(req.query.architectTier) : undefined,
    vastuRequired: req.query.vastu === "true" ? true : undefined,
    sustainabilityFocus: req.query.sustainability === "true" ? true : undefined,
  };

  const [architects, saved, consultations] = await Promise.all([
    prisma.user.findMany({ where: { role: 'ARCHITECT' }, orderBy: { rating: 'desc' } }),
    homeownerId ? SavedArchitectModel.find({ userId: homeownerId }) : [],
    homeownerId ? prisma.consultation.findMany({ where: { userId: homeownerId } }) : [],
  ]);

  const ranked = rankArchitects(architects, prefs, saved, consultations);
  const context = [
    latestBrief?.location ? `Location: ${latestBrief.location}` : null,
    latestBrief?.projectType ? `Project type: ${latestBrief.projectType}` : null,
    latestBrief?.budget ? `Budget: ${latestBrief.budget}` : null,
    latestBrief?.stylePreferences?.length ? `Styles: ${latestBrief.stylePreferences.join(", ")}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const enriched = await Promise.all(
    ranked.map(async (architect) => {
      const plainArchitect = typeof (architect as { toObject?: () => unknown }).toObject === "function"
        ? (architect as { toObject: () => Record<string, unknown> }).toObject()
        : (architect as unknown as Record<string, unknown>);

      const recommendationReason = await generateRecommendationReason(plainArchitect, context);

      return {
        ...plainArchitect,
        recommendationReason,
      };
    }),
  );

  res.status(200).json({
    source: latestBrief ? "project-brief+activity" : "activity",
    recommendations: enriched,
  });
});

import type { Request, Response } from "express";
import { ArchitectModel } from "../models/Architect.js";
import { ConsultationModel } from "../models/Consultation.js";
import { ProjectBriefModel } from "../models/ProjectBrief.js";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { rankArchitects } from "../utils/matchingEngine.js";

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
  };

  const architects = await ArchitectModel.find().sort({ rating: -1 });
  const saved = req.auth?.sub
    ? await SavedArchitectModel.find({ userId: req.auth.sub })
    : [];
  const consultations = req.auth?.sub
    ? await ConsultationModel.find({ userId: req.auth.sub })
    : [];

  const ranked = rankArchitects(architects, prefs, saved, consultations);

  res.status(200).json(ranked);
});

export const getHomeownerRecommendations = asyncHandler(async (req: Request, res: Response) => {
  const homeownerId = req.auth?.sub;

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
  };

  const [architects, saved, consultations] = await Promise.all([
    ArchitectModel.find().sort({ rating: -1 }),
    homeownerId ? SavedArchitectModel.find({ userId: homeownerId }) : [],
    homeownerId ? ConsultationModel.find({ userId: homeownerId }) : [],
  ]);

  const ranked = rankArchitects(architects, prefs, saved, consultations);

  res.status(200).json({
    source: latestBrief ? "project-brief+activity" : "activity",
    recommendations: ranked,
  });
});

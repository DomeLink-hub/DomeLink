import type { Request, Response } from "express";
import { ProjectBriefModel } from "../models/ProjectBrief.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

export const getMyProjectBriefs = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user?.id || (req as any).auth?.sub) as string | undefined;
  if (!userId) throw new AppError("Unauthorized", 401);
  const briefs = await ProjectBriefModel.find({ homeownerId: userId }).sort({ updatedAt: -1 }).lean();
  res.status(200).json(briefs);
});

export const createProjectBrief = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user?.id || (req as any).auth?.sub) as string | undefined;
  if (!userId) throw new AppError("Unauthorized", 401);
  const payload = req.body || {};
  const doc = await ProjectBriefModel.create({
    homeownerId: userId,
    projectName: payload.projectName || "",
    projectType: payload.projectType || "",
    plotSize: payload.plotSize || "",
    budget: payload.budget || "",
    location: payload.location || "",
    stylePreferences: payload.stylePreferences || [],
    timeline: payload.timeline || "",
    requirements: payload.requirements || "",
    inspirationImages: payload.inspirationImages || [],
    status: payload.status || "draft",
  });
  res.status(201).json(doc);
});

export const updateProjectBrief = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user?.id || (req as any).auth?.sub) as string | undefined;
  if (!userId) throw new AppError("Unauthorized", 401);
  const briefId = req.params.briefId;
  const existing = await ProjectBriefModel.findById(briefId);
  if (!existing) throw new AppError("Project brief not found", 404);
  if (String(existing.homeownerId) !== String(userId)) throw new AppError("Forbidden", 403);
  Object.assign(existing, req.body || {});
  await existing.save();
  res.status(200).json(existing);
});
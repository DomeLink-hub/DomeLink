import type { Request, Response } from "express";
import { z } from "zod";
import { ProjectBriefModel } from "../models/ProjectBrief.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createProjectBriefSchema = z.object({
  projectName: z.string().min(2),
  projectType: z.enum(["residential", "commercial", "interior", "landscape"]),
  plotSize: z.string().min(1),
  budget: z.string().min(1),
  location: z.string().min(1),
  stylePreferences: z.array(z.string()).default([]),
  timeline: z.string().min(1),
  requirements: z.string().min(10),
  inspirationImages: z.array(z.string().url()).default([]),
  status: z.enum(["draft", "submitted", "in_progress", "completed"]).optional(),
});

const updateProjectBriefSchema = createProjectBriefSchema.partial();

export const createProjectBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = createProjectBriefSchema.parse(req.body);

  const projectBrief = await ProjectBriefModel.create({
    homeownerId: req.auth.sub,
    ...payload,
    status: payload.status ?? "draft",
  });

  res.status(201).json(projectBrief);
});

export const getMyProjectBriefs = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const projectBriefs = await ProjectBriefModel.find({ homeownerId: req.auth.sub }).sort({ createdAt: -1 });

  res.status(200).json(projectBriefs);
});

export const updateProjectBrief = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = updateProjectBriefSchema.parse(req.body);

  const existing = await ProjectBriefModel.findById(req.params.briefId);
  if (!existing) {
    throw new AppError("Project brief not found", 404);
  }

  if (String(existing.homeownerId) !== req.auth.sub && req.auth.role !== "admin") {
    throw new AppError("Forbidden", 403);
  }

  existing.set(payload);
  await existing.save();

  res.status(200).json(existing);
});

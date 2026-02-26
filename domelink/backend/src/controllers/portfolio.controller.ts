import type { Request, Response } from "express";
import { z } from "zod";
import { PortfolioProjectModel } from "../models/PortfolioProject.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPortfolioSchema = z.object({
  architectId: z.string(),
  title: z.string().min(2),
  images: z.array(z.string().url()).default([]),
  description: z.string().min(5),
  location: z.string().optional(),
  year: z.string().optional(),
  area: z.string().optional(),
});

export const createPortfolioProject = asyncHandler(async (req: Request, res: Response) => {
  const payload = createPortfolioSchema.parse(req.body);

  const project = await PortfolioProjectModel.create(payload);
  res.status(201).json(project);
});

export const getPortfolioByArchitect = asyncHandler(async (req: Request, res: Response) => {
  const projects = await PortfolioProjectModel.find({ architectId: req.params.architectId }).sort({ createdAt: -1 });
  res.status(200).json(projects);
});

export const updatePortfolioProject = asyncHandler(async (req: Request, res: Response) => {
  const payload = createPortfolioSchema.partial().parse(req.body);
  const project = await PortfolioProjectModel.findByIdAndUpdate(req.params.projectId, payload, { new: true });

  if (!project) {
    throw new AppError("Portfolio project not found", 404);
  }

  res.status(200).json(project);
});

export const deletePortfolioProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await PortfolioProjectModel.findByIdAndDelete(req.params.projectId);

  if (!project) {
    throw new AppError("Portfolio project not found", 404);
  }

  res.status(204).send();
});

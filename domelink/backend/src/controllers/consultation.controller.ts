import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { ConsultationModel } from "../models/Consultation.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createConsultationSchema = z.object({
  architectId: z.string().optional(),
  message: z.string().min(5),
  preferredDate: z.string().optional(),
  projectType: z.string().optional(),
  budget: z.number().optional(),
  plotSize: z.string().optional(),
  preferredStyle: z.string().optional(),
  location: z.string().optional(),
});

const updateConsultationStatusSchema = z.object({
  status: z.enum(["pending", "active", "closed", "accepted", "completed", "rejected"]),
});

export const createConsultation = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = createConsultationSchema.parse(req.body);
  const fallbackArchitect = await ArchitectModel.findOne().sort({ rating: -1 });

  if (!payload.architectId && !fallbackArchitect) {
    throw new AppError("No architects available", 400);
  }

  const architectId = payload.architectId || String(fallbackArchitect?._id);
  const existing = await ConsultationModel.findOne({
    userId: req.auth.sub,
    architectId,
    status: { $in: ["pending", "active"] },
  });

  if (existing) {
    throw new AppError("An active consultation already exists for this architect", 409);
  }

  const consultation = await ConsultationModel.create({
    userId: req.auth.sub,
    architectId,
    message: payload.message,
    status: "pending",
    preferredDate: payload.preferredDate ? new Date(payload.preferredDate) : undefined,
    projectType: payload.projectType,
    budget: payload.budget,
    plotSize: payload.plotSize,
    preferredStyle: payload.preferredStyle,
    location: payload.location,
  });

  res.status(201).json(consultation);
});

export const getMyConsultations = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub || !req.auth.role) {
    throw new AppError("Unauthorized", 401);
  }

  let query: Record<string, unknown> = { userId: req.auth.sub };

  if (req.auth.role === "architect") {
    const ownedArchitects = await ArchitectModel.find({ createdBy: req.auth.sub }).select("_id");
    const architectIds = ownedArchitects.map((architect) => architect._id);
    query = { architectId: { $in: architectIds } };
  }

  const consultations = await ConsultationModel.find(query)
    .populate("architectId", "name slug specialty")
    .populate("userId", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(consultations);
});

export const updateConsultationStatus = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub || !req.auth.role) {
    throw new AppError("Unauthorized", 401);
  }

  const payload = updateConsultationStatusSchema.parse(req.body);

  const consultation = await ConsultationModel.findById(req.params.consultationId);
  if (!consultation) {
    throw new AppError("Consultation not found", 404);
  }

  if (req.auth.role === "architect") {
    const ownsArchitectProfile = await ArchitectModel.exists({
      _id: consultation.architectId,
      createdBy: req.auth.sub,
    });

    if (!ownsArchitectProfile) {
      throw new AppError("Forbidden", 403);
    }
  }

  consultation.status = payload.status;
  await consultation.save();

  const hydrated = await ConsultationModel.findById(consultation._id)
    .populate("architectId", "name slug specialty")
    .populate("userId", "name email");

  res.status(200).json(hydrated);
});

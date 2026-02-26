import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { ConsultationModel } from "../models/Consultation.js";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { UserModel } from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sanitizeUser } from "../utils/response.js";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
  styleTags: z.array(z.string()).optional(),
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const user = await UserModel.findById(req.auth.sub);
  if (!user) throw new AppError("User not found", 404);

  const consultationCount = await ConsultationModel.countDocuments(
    req.auth.role === "architect" ? { architectId: req.auth.sub } : { userId: req.auth.sub },
  );

  const earnings = req.auth.role === "architect" ? consultationCount * 49 : 0;

  res.status(200).json({ user: sanitizeUser(user), consultationCount, earnings });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const payload = updateProfileSchema.parse(req.body);
  const user = await UserModel.findByIdAndUpdate(req.auth.sub, payload, { new: true });

  if (!user) throw new AppError("User not found", 404);

  res.status(200).json({ user: sanitizeUser(user) });
});

export const getSavedArchitects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const saved = await SavedArchitectModel.find({ userId: req.auth.sub }).populate("architectId");
  const architects = saved.map((entry) => entry.architectId);

  res.status(200).json(architects);
});

export const saveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const architect = await ArchitectModel.findById(req.params.architectId);
  if (!architect) throw new AppError("Architect not found", 404);

  await SavedArchitectModel.updateOne(
    { userId: req.auth.sub, architectId: architect._id },
    { $setOnInsert: { userId: req.auth.sub, architectId: architect._id } },
    { upsert: true },
  );

  res.status(200).json({ ok: true });
});

export const unsaveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  await SavedArchitectModel.deleteOne({ userId: req.auth.sub, architectId: req.params.architectId });

  res.status(200).json({ ok: true });
});

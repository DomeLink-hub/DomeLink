import type { Request, Response } from "express";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { ArchitectModel } from "../models/Architect.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const saveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const architect = await ArchitectModel.findById(req.body.architectId);
  if (!architect) throw new AppError("Architect not found", 404);

  await SavedArchitectModel.updateOne(
    { userId: req.auth.sub, architectId: architect._id },
    { $setOnInsert: { userId: req.auth.sub, architectId: architect._id } },
    { upsert: true },
  );

  res.status(201).json({ ok: true });
});

export const unsaveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  await SavedArchitectModel.deleteOne({
    userId: req.auth.sub,
    architectId: req.params.architectId,
  });

  res.status(200).json({ ok: true });
});

export const getSavedArchitects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);

  const saved = await SavedArchitectModel.find({ userId: req.auth.sub }).populate("architectId");
  const architects = saved.map((entry) => entry.architectId);

  res.status(200).json(architects);
});

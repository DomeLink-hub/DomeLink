import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { ConsultationModel } from "../models/Consultation.js";
import { UserModel } from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const updateUserStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});

const updateArchitectModerationSchema = z.object({
  moderationStatus: z.enum(["pending", "approved", "rejected"]),
  isVerified: z.boolean(),
});

export const getAdminOverview = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalArchitects,
    verifiedArchitects,
    pendingArchitects,
    totalConsultations,
    activeConsultations,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ status: "active" }),
    UserModel.countDocuments({ status: "suspended" }),
    ArchitectModel.countDocuments(),
    ArchitectModel.countDocuments({ isVerified: true }),
    ArchitectModel.countDocuments({ moderationStatus: "pending" }),
    ConsultationModel.countDocuments(),
    ConsultationModel.countDocuments({ status: { $in: ["pending", "active", "accepted"] } }),
  ]);

  res.status(200).json({
    totalUsers,
    activeUsers,
    suspendedUsers,
    totalArchitects,
    verifiedArchitects,
    pendingArchitects,
    totalConsultations,
    activeConsultations,
  });
});

export const listUsersAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserModel.find()
    .select("name email role status createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.status(200).json(users);
});

export const updateUserStatusAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateUserStatusSchema.parse(req.body);

  const user = await UserModel.findById(req.params.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "admin" && payload.status === "suspended") {
    throw new AppError("Cannot suspend admin accounts", 400);
  }

  user.status = payload.status;
  user.tokenVersion += 1;
  await user.save();

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
  });
});

export const listArchitectsAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const architects = await ArchitectModel.find()
    .select("name slug specialty location moderationStatus isVerified createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  res.status(200).json(architects);
});

export const updateArchitectModerationAdmin = asyncHandler(async (req: Request, res: Response) => {
  const payload = updateArchitectModerationSchema.parse(req.body);

  const architect = await ArchitectModel.findByIdAndUpdate(
    req.params.architectId,
    {
      moderationStatus: payload.moderationStatus,
      isVerified: payload.isVerified,
    },
    { new: true },
  )
    .select("name slug specialty location moderationStatus isVerified createdAt")
    .lean();

  if (!architect) {
    throw new AppError("Architect not found", 404);
  }

  res.status(200).json(architect);
});

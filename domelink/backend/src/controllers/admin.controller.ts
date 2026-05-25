import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { ConsultationModel } from "../models/Consultation.js";
import UserModel from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import prisma from "../config/prisma.js";
import { auditAdmin, auditVerification } from "../services/audit/audit.service.js";

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
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "admin" && payload.status === "suspended") throw new AppError("Cannot suspend admin accounts", 400);

  user.status = payload.status;
  user.tokenVersion += 1;
  await user.save();

  auditAdmin(req.user?.id || "system", `user.${payload.status}`, String(user._id), { email: user.email, role: user.role });

  res.status(200).json({ _id: user._id, name: user.name, email: user.email, role: user.role, status: user.status, createdAt: user.createdAt });
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
    { moderationStatus: payload.moderationStatus, isVerified: payload.isVerified },
    { new: true },
  ).select("name slug specialty location moderationStatus isVerified createdAt").lean();

  if (!architect) throw new AppError("Architect not found", 404);

  auditVerification(
    req.user?.id || "system",
    req.params.architectId,
    payload.moderationStatus === "approved" ? "approved" : "rejected",
    { isVerified: payload.isVerified }
  );

  res.status(200).json(architect);
});

export const getBillingModerationAdmin = asyncHandler(async (_req: Request, res: Response) => {
  const [payments, subscriptions, featuredPlacements, uploads] = await Promise.all([
    prisma.payment.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.subscription.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.featuredPlacement.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.uploadAsset.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  res.status(200).json({ payments, subscriptions, featuredPlacements, uploads });
});

export const listWebhooksAdmin = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 50), 200);
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.webhookEvent.findMany({ orderBy: { createdAt: "desc" }, skip, take: limit }),
    prisma.webhookEvent.count(),
  ]);

  res.status(200).json({ items, total, page, limit });
});

export const getWebhookAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.webhookId;
  const event = await prisma.webhookEvent.findUnique({ where: { id } });
  if (!event) throw new AppError("Webhook event not found", 404);
  res.status(200).json(event);
});

export const listWebhookReplaysAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.webhookId;
  const event = await prisma.webhookEvent.findUnique({ where: { id } });
  if (!event) throw new AppError("Webhook event not found", 404);

  const replays = await prisma.webhookReplay.findMany({ where: { webhookEventId: id }, orderBy: { replayedAt: "desc" } });
  res.status(200).json(replays);
});

export const replayWebhookAdmin = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.webhookId;
  const event = await prisma.webhookEvent.findUnique({ where: { id } });
  if (!event) throw new AppError("Webhook event not found", 404);

  // Do not allow replay from non-admin earlier; caller is already protected
  const payloadAny = event.payload as any;
  const paymentEntity = (payloadAny?.payment?.entity || payloadAny?.order?.entity || payloadAny?.entity || {}) as Record<string, unknown>;
  const orderId = String(paymentEntity.order_id || paymentEntity.orderId || paymentEntity.id || "");
  const paymentId = String(paymentEntity.id || paymentEntity.payment_id || paymentEntity.paymentId || "");

  if (!orderId || !paymentId) {
    throw new AppError("Webhook payload does not contain order/payment identifiers", 400);
  }
  // cooldown: limit replays per event to 5 per hour
  const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60);
  const recentCount = await prisma.webhookReplay.count({ where: { webhookEventId: id, replayedAt: { gte: oneHourAgo } } });
  if (recentCount >= 5) {
    throw new AppError("Replay limit exceeded for this webhook event (try later)", 429);
  }

  // record replay attempt
  const adminId = req.user?.id as string;
  const replayRecord = await prisma.webhookReplay.create({ data: { webhookEventId: id, adminId, notes: {} } });

  let ok = false;
  try {
    await import("../controllers/payment.controller.js").then(async (mod) => {
      if (typeof mod.reconcilePaymentByOrderId === "function") {
        await mod.reconcilePaymentByOrderId(orderId, paymentId, event.signature || undefined);
        ok = true;
      } else {
        throw new AppError("Reconciliation function unavailable", 500);
      }
    });
  } catch (err: any) {
    // attach error notes to replay record
    await prisma.webhookReplay.update({ where: { id: replayRecord.id }, data: { notes: { error: String(err?.message || err) } } });
    throw err;
  }

  await prisma.webhookEvent.update({ where: { id }, data: { processed: true, processedAt: new Date() } });
  await prisma.webhookReplay.update({ where: { id: replayRecord.id }, data: { notes: { success: true }, replayedAt: new Date() } });

  res.status(200).json({ ok: true });
});

export const moderateUploadAdmin = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    isApproved: z.boolean(),
  });
  const payload = schema.parse(req.body);
  const asset = await prisma.uploadAsset.update({
    where: { id: req.params.assetId },
    data: { isApproved: payload.isApproved },
  });
  res.status(200).json(asset);
});

export const manageFeaturedArchitectAdmin = asyncHandler(async (req: Request, res: Response) => {
  const schema = z.object({
    isActive: z.boolean(),
    rank: z.number().int().min(0).max(100).optional(),
  });
  const payload = schema.parse(req.body);

  const placement = await prisma.featuredPlacement.update({
    where: { id: req.params.placementId },
    data: { isActive: payload.isActive, ...(typeof payload.rank === "number" ? { rank: payload.rank } : {}) },
  });

  res.status(200).json(placement);
});

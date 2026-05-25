import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../services/storage/delete.service.js";
import { uploadToCloudinary } from "../services/storage/upload.service.js";

const scopeMap = {
  architect: "architects",
  portfolio: "portfolios",
  consultation: "consultations",
  inspiration: "inspirations",
  project: "projects",
  deliverable: "deliverables",
} as const;

const inferScope = (value: unknown) => {
  const normalized = String(value || "project").toLowerCase();
  return scopeMap[normalized as keyof typeof scopeMap] || "projects";
};

export const uploadAsset = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!file) throw new AppError("Upload file is required", 400);

  const scope = inferScope(req.body.scope);
  const uploaded = await uploadToCloudinary(file.buffer, file.mimetype, {
    scope,
    fileName: file.originalname,
  });

  const asset = await prisma.uploadAsset.create({
    data: {
      uploadedById: userId,
      consultationId: req.body.consultationId || null,
      projectId: req.body.projectId || null,
      portfolioProjectId: req.body.portfolioProjectId || null,
      scope: scope.toUpperCase() as "ARCHITECTS" | "PORTFOLIOS" | "CONSULTATIONS" | "INSPIRATIONS" | "PROJECTS" | "DELIVERABLES",
      name: file.originalname,
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      mimeType: file.mimetype,
      size: file.size,
      width: uploaded.width,
      height: uploaded.height,
      metadata: { resourceType: uploaded.resource_type },
    },
  });

  res.status(201).json({ asset, uploaded });
});

export const listAssets = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const consultationId = req.query.consultationId ? String(req.query.consultationId) : undefined;
  const projectId = req.query.projectId ? String(req.query.projectId) : undefined;

  const assets = await prisma.uploadAsset.findMany({
    where: consultationId || projectId ? { OR: [{ uploadedById: userId }, ...(consultationId ? [{ consultationId }] : []), ...(projectId ? [{ projectId }] : [])] } : { uploadedById: userId },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(assets);
});

export const deleteAsset = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const asset = await prisma.uploadAsset.findUnique({ where: { id: req.params.assetId } });
  if (!asset) throw new AppError("Asset not found", 404);
  if (asset.uploadedById !== userId && req.user?.role !== "ADMIN") {
    throw new AppError("Forbidden", 403);
  }

  await deleteFromCloudinary(asset.publicId, asset.mimeType.startsWith("image/") ? "image" : "raw");
  await prisma.uploadAsset.delete({ where: { id: asset.id } });

  res.status(200).json({ ok: true });
});

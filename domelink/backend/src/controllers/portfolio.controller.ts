import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const prisma = new PrismaClient();

const normalizeImages = (images: unknown) => {
  if (Array.isArray(images)) return images.filter(Boolean).map((image) => String(image));
  if (typeof images === "string" && images.length > 0) return [images];
  return [];
};

export const getPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;

  const projects = await prisma.portfolioProject.findMany({
    where: { architectId },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  res.status(200).json(
    projects.map((project) => ({
      ...project,
      _id: project.id,
      images: normalizeImages(project.images),
    })),
  );
});

export const createPortfolio = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const subscription = await prisma.subscription.findUnique({ where: { userId: architectId } });
  const tier = subscription?.tier || "FREE";

  const projectCount = await prisma.portfolioProject.count({ where: { architectId } });

  if (tier === "FREE" && projectCount >= 10) {
    throw new AppError("Free tier is limited to 10 portfolio projects. Please upgrade to Pro.", 403);
  }
  if (tier === "PRO" && projectCount >= 50) {
    throw new AppError("Pro tier is limited to 50 portfolio projects. Please upgrade to Studio.", 403);
  }

  const project = await prisma.portfolioProject.create({
    data: {
      architectId,
      title: String(req.body.title || "Untitled project"),
      description: String(req.body.description || ""),
      images: normalizeImages(req.body.images),
      location: req.body.location ? String(req.body.location) : null,
      year: req.body.year ? String(req.body.year) : null,
      area: req.body.area ? String(req.body.area) : null,
      style: req.body.style ? String(req.body.style) : null,
      projectType: req.body.projectType ? String(req.body.projectType) : null,
      clientName: req.body.clientName ? String(req.body.clientName) : null,
      featured: Boolean(req.body.featured),
    },
  });

  res.status(201).json({
    ...project,
    _id: project.id,
    images: normalizeImages(project.images),
  });
});

export const updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const existing = await prisma.portfolioProject.findUnique({ where: { id: projectId } });
  if (!existing) throw new AppError("Portfolio project not found", 404);
  if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN" && req.user?.id !== existing.architectId) {
    throw new AppError("Forbidden", 403);
  }

  const project = await prisma.portfolioProject.update({
    where: { id: projectId },
    data: {
      title: req.body.title ? String(req.body.title) : undefined,
      description: req.body.description ? String(req.body.description) : undefined,
      images: req.body.images ? normalizeImages(req.body.images) : undefined,
      location: req.body.location ? String(req.body.location) : undefined,
      year: req.body.year ? String(req.body.year) : undefined,
      area: req.body.area ? String(req.body.area) : undefined,
      style: req.body.style ? String(req.body.style) : undefined,
      projectType: req.body.projectType ? String(req.body.projectType) : undefined,
      clientName: req.body.clientName ? String(req.body.clientName) : undefined,
      featured: typeof req.body.featured === "boolean" ? req.body.featured : undefined,
    },
  });

  res.status(200).json({
    ...project,
    _id: project.id,
    images: normalizeImages(project.images),
  });
});

export const deletePortfolio = asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.projectId;
  const existing = await prisma.portfolioProject.findUnique({ where: { id: projectId } });
  if (!existing) throw new AppError("Portfolio project not found", 404);
  if (req.user?.role !== "ADMIN" && req.user?.role !== "SUPERADMIN" && req.user?.id !== existing.architectId) {
    throw new AppError("Forbidden", 403);
  }

  await prisma.portfolioProject.delete({ where: { id: projectId } });

  res.status(200).json({ ok: true });
});
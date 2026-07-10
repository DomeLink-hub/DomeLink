import type { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const normalizeStyleTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter((s) => s.trim().length > 0);
  if (typeof value === "string" && value.trim().length > 0) return [value.trim()];
  return [];
};

export const saveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const architectId = String(req.body.architectId || "").trim();
  if (!architectId) throw new AppError("Architect id is required", 400);

  const architectUser = await prisma.user.findFirst({
    where: { id: architectId, role: "ARCHITECT" },
    select: { id: true },
  });
  if (!architectUser) throw new AppError("Architect not found", 404);

  // Upsert — ignore if already saved (unique constraint)
  await prisma.savedArchitect.upsert({
    where: { userId_architectId: { userId: req.user.id, architectId } },
    update: {},
    create: { userId: req.user.id, architectId },
  });

  res.status(201).json({ ok: true });
});

export const unsaveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  await prisma.savedArchitect.deleteMany({
    where: { userId: req.user.id, architectId: req.params.architectId },
  });

  res.status(200).json({ ok: true });
});

export const getSavedArchitects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const saved = await prisma.savedArchitect.findMany({
    where: { userId: req.user.id },
    select: { architectId: true },
  });

  const architectIds = saved.map((s) => s.architectId);

  const architects = architectIds.length
    ? await prisma.user.findMany({
        where: { id: { in: architectIds }, role: "ARCHITECT" },
        select: {
          id: true, slug: true, name: true, location: true, specialty: true,
          rating: true, startingPrice: true, about: true, heroImage: true,
          profileImage: true, experience: true, teamSize: true, isVerified: true,
          isFeatured: true, consultationFee: true, completedProjects: true,
          reviewCount: true, trustScore: true, designStyles: true, projectTypes: true,
          citiesServed: true, servicesOffered: true,
        },
      })
    : [];

  res.status(200).json(
    architects.map((a) => ({
      _id: a.id, slug: a.slug || a.id, name: a.name,
      location: a.location || "", specialty: a.specialty || "",
      rating: a.rating || 0, startingPrice: a.startingPrice || 0,
      about: a.about || "", heroImage: a.heroImage || "",
      profileImage: a.profileImage || "", projects: [], templates: [],
      experience: a.experience || "", teamSize: a.teamSize || 1,
      isVerified: a.isVerified, isFeatured: a.isFeatured,
      consultationFee: a.consultationFee, completedProjects: a.completedProjects,
      reviewCount: a.reviewCount, trustScore: a.trustScore,
      designStyles: normalizeStyleTags(a.designStyles),
      projectTypes: normalizeStyleTags(a.projectTypes),
      citiesServed: normalizeStyleTags(a.citiesServed),
      servicesOffered: normalizeStyleTags(a.servicesOffered),
    })),
  );
});

export const getMySavers = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const savedRecords = await prisma.savedArchitect.findMany({
    where: { architectId },
    select: { userId: true, createdAt: true },
  });

  if (savedRecords.length === 0) return res.status(200).json([]);

  const homeownerIds = savedRecords.map((r) => r.userId);
  const homeowners = await prisma.user.findMany({
    where: { id: { in: homeownerIds }, role: "CLIENT" },
    select: { id: true, city: true, projectType: true, budgetMin: true, budgetMax: true, preferredStyles: true },
  });

  const homeownersById = new Map(homeowners.map((h) => [h.id, h]));

  return res.status(200).json(
    savedRecords
      .map((record) => {
        const h = homeownersById.get(record.userId);
        if (!h) return null;
        return {
          userId: h.id, city: h.city, projectType: h.projectType,
          budgetRange: { min: h.budgetMin, max: h.budgetMax },
          styleTags: normalizeStyleTags(h.preferredStyles),
          savedAt: record.createdAt,
        };
      })
      .filter(Boolean),
  );
});

export const startConversationWithSaver = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const homeownerId = String(req.params.userId || "").trim();
  if (!homeownerId) throw new AppError("Homeowner id is required", 400);

  const savedRecord = await prisma.savedArchitect.findUnique({
    where: { userId_architectId: { userId: homeownerId, architectId } },
  });
  if (!savedRecord) throw new AppError("This homeowner has not saved you", 404);

  const [architect, homeowner] = await Promise.all([
    prisma.user.findUnique({ where: { id: architectId }, select: { id: true, role: true, name: true, avatar: true } }),
    prisma.user.findUnique({ where: { id: homeownerId }, select: { id: true, role: true, name: true, avatar: true } }),
  ]);

  if (!architect || architect.role !== "ARCHITECT") throw new AppError("Architect not found", 404);
  if (!homeowner || homeowner.role !== "CLIENT") throw new AppError("Homeowner not found", 404);

  let consultation = await prisma.consultation.findFirst({
    where: { userId: homeownerId, architectId },
    orderBy: { createdAt: "desc" },
  });

  if (!consultation) {
    consultation = await prisma.consultation.create({
      data: { userId: homeownerId, architectId, status: "PENDING", message: "Architect reached out after you saved their profile.", amount: 0 },
    });
  }

  return res.status(200).json({
    _id: consultation.id, id: consultation.id,
    userId: { _id: homeowner.id, id: homeowner.id, name: homeowner.name, avatar: homeowner.avatar, role: homeowner.role },
    architectId: { _id: architect.id, id: architect.id, name: architect.name, avatar: architect.avatar, role: architect.role },
    message: consultation.message, projectType: consultation.projectType,
    status: consultation.status, amount: consultation.amount, createdAt: consultation.createdAt,
  });
});

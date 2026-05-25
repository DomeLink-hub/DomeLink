import type { Request, Response } from "express";
import { SavedArchitectModel } from "../models/SavedArchitect.js";
import { ArchitectModel } from "../models/Architect.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import prisma from "../config/prisma.js";

export const saveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const architectId = String(req.body.architectId || "").trim();
  if (!architectId) throw new AppError("Architect id is required", 400);

  const architectUser = await prisma.user.findFirst({
    where: { id: architectId, role: "ARCHITECT" },
    select: { id: true },
  });

  if (!architectUser) {
    const legacyArchitect = await ArchitectModel.findById(architectId);
    if (!legacyArchitect) throw new AppError("Architect not found", 404);
  }

  await SavedArchitectModel.updateOne(
    { userId: req.user.id, architectId },
    { $setOnInsert: { userId: req.user.id, architectId } },
    { upsert: true },
  );

  res.status(201).json({ ok: true });
});

export const unsaveArchitect = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  await SavedArchitectModel.deleteOne({
    userId: req.user.id,
    architectId: req.params.architectId,
  });

  res.status(200).json({ ok: true });
});

export const getSavedArchitects = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) throw new AppError("Unauthorized", 401);

  const saved = await SavedArchitectModel.find({ userId: req.user.id })
    .select({ architectId: 1, _id: 0 })
    .lean();
  const architectIds = saved.map((entry) => String(entry.architectId));

  const architects = architectIds.length
    ? await prisma.user.findMany({
        where: { id: { in: architectIds }, role: "ARCHITECT" },
        select: {
          id: true,
          slug: true,
          name: true,
          location: true,
          specialty: true,
          rating: true,
          startingPrice: true,
          about: true,
          heroImage: true,
          profileImage: true,
          experience: true,
          teamSize: true,
          isVerified: true,
          isFeatured: true,
          consultationFee: true,
          completedProjects: true,
          reviewCount: true,
          trustScore: true,
          designStyles: true,
          projectTypes: true,
          citiesServed: true,
          servicesOffered: true,
        },
      })
    : [];

  const payload = architects.map((architect) => ({
    _id: architect.id,
    slug: architect.slug || architect.id,
    name: architect.name,
    location: architect.location || "",
    specialty: architect.specialty || "",
    rating: architect.rating || 0,
    startingPrice: architect.startingPrice || 0,
    about: architect.about || "",
    heroImage: architect.heroImage || "",
    profileImage: architect.profileImage || "",
    projects: [],
    templates: [],
    experience: architect.experience || "",
    teamSize: architect.teamSize || 1,
    isVerified: architect.isVerified,
    isFeatured: architect.isFeatured,
    consultationFee: architect.consultationFee,
    completedProjects: architect.completedProjects,
    reviewCount: architect.reviewCount,
    trustScore: architect.trustScore,
    designStyles: normalizeStyleTags(architect.designStyles),
    projectTypes: normalizeStyleTags(architect.projectTypes),
    citiesServed: normalizeStyleTags(architect.citiesServed),
    servicesOffered: normalizeStyleTags(architect.servicesOffered),
  }));

  res.status(200).json(payload);
});

const normalizeStyleTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter((item) => item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

export const getMySavers = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const savedRecords = await SavedArchitectModel.find({ architectId })
    .select({ userId: 1, createdAt: 1, _id: 0 })
    .lean();

  if (savedRecords.length === 0) {
    return res.status(200).json([]);
  }

  const homeownerIds = savedRecords.map((record) => String(record.userId));
  const homeowners = await prisma.user.findMany({
    where: { id: { in: homeownerIds }, role: "CLIENT" },
    select: {
      id: true,
      city: true,
      projectType: true,
      budgetMin: true,
      budgetMax: true,
      preferredStyles: true,
    },
  });

  const homeownersById = new Map(homeowners.map((homeowner) => [homeowner.id, homeowner]));

  const payload = savedRecords
    .map((record) => {
      const homeowner = homeownersById.get(String(record.userId));
      if (!homeowner) return null;
      return {
        userId: homeowner.id,
        city: homeowner.city,
        projectType: homeowner.projectType,
        budgetRange: {
          min: homeowner.budgetMin,
          max: homeowner.budgetMax,
        },
        styleTags: normalizeStyleTags(homeowner.preferredStyles),
        savedAt: record.createdAt,
      };
    })
    .filter(Boolean);

  return res.status(200).json(payload);
});

export const startConversationWithSaver = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const homeownerId = String(req.params.userId || "").trim();
  if (!homeownerId) throw new AppError("Homeowner id is required", 400);

  const savedRecord = await SavedArchitectModel.findOne({ userId: homeownerId, architectId }).lean();
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
      data: {
        userId: homeownerId,
        architectId,
        status: "PENDING",
        message: "Architect reached out after you saved their profile.",
        amount: 0,
      },
    });
  }

  return res.status(200).json({
    _id: consultation.id,
    id: consultation.id,
    userId: {
      _id: homeowner.id,
      id: homeowner.id,
      name: homeowner.name,
      avatar: homeowner.avatar,
      role: homeowner.role,
    },
    architectId: {
      _id: architect.id,
      id: architect.id,
      name: architect.name,
      avatar: architect.avatar,
      role: architect.role,
    },
    message: consultation.message,
    projectType: consultation.projectType,
    status: consultation.status,
    amount: consultation.amount,
    createdAt: consultation.createdAt,
  });
});

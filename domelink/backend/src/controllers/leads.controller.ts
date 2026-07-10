import type { Request, Response } from "express";
import type { Prisma } from "@prisma/client";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";
import { createAndEmitNotification } from "../services/notification.service.js";

type LeadRecord = {
  id: string;
  city: string | null;
  projectType: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  plotSize: number | null;
  preferredStyles: unknown;
  timeline: string | null;
  familySize: number | null;
  createdAt: Date;
};

const parseNumericQuery = (value: unknown): number | undefined => {
  if (typeof value !== "string" || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
};

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim())
      .filter((entry) => entry.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }
  return [];
};

const extractAvoraScore = (report: unknown): number | null => {
  if (!report || typeof report !== "object") return null;
  const objectReport = report as Record<string, unknown>;
  const readinessRaw = Number(objectReport.readinessScore);
  if (Number.isFinite(readinessRaw)) {
    return Math.max(0, Math.min(100, Math.round(readinessRaw)));
  }
  const complexityRaw = Number(objectReport.complexityScore);
  if (Number.isFinite(complexityRaw)) {
    // Some reports use 0-10 complexity; convert to a rough 0-100 signal.
    return Math.max(0, Math.min(100, Math.round(complexityRaw * 10)));
  }
  return null;
};

const applyBudgetFilters = (
  leads: LeadRecord[],
  requestedBudgetMin?: number,
  requestedBudgetMax?: number,
): LeadRecord[] => {
  return leads.filter((lead) => {
    const leadMin = lead.budgetMin ?? 0;
    const leadMax = lead.budgetMax ?? Number.MAX_SAFE_INTEGER;

    if (requestedBudgetMin !== undefined && leadMax < requestedBudgetMin) {
      return false;
    }
    if (requestedBudgetMax !== undefined && leadMin > requestedBudgetMax) {
      return false;
    }
    return true;
  });
};

export const getClientLeads = asyncHandler(async (req: Request, res: Response) => {
  const requestedCity = typeof req.query.city === "string" ? req.query.city.trim() : "";
  const requestedBudgetMin = parseNumericQuery(req.query.budgetMin);
  const requestedBudgetMax = parseNumericQuery(req.query.budgetMax);

  const where: Prisma.UserWhereInput = {
    role: "CLIENT",
    onboardingCompleted: true,
  };

  if (requestedCity) {
    where.city = {
      equals: requestedCity,
      mode: "insensitive",
    };
  }

  const leads = await prisma.user.findMany({
    where,
    select: {
      id: true,
      city: true,
      projectType: true,
      budgetMin: true,
      budgetMax: true,
      plotSize: true,
      preferredStyles: true,
      timeline: true,
      familySize: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const budgetFilteredLeads = applyBudgetFilters(leads, requestedBudgetMin, requestedBudgetMax);
  const homeownerIds = budgetFilteredLeads.map((lead) => lead.id);

  const avoraEstimates = homeownerIds.length
    ? await prisma.avoraEstimate.findMany({
      where: { homeownerId: { in: homeownerIds } },
      select: { homeownerId: true, report: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    })
    : [];

  const latestAvoraByUser = new Map<string, number | null>();
  for (const estimate of avoraEstimates) {
    if (latestAvoraByUser.has(estimate.homeownerId)) continue;
    latestAvoraByUser.set(estimate.homeownerId, extractAvoraScore(estimate.report));
  }

  const payload = budgetFilteredLeads.map((lead) => ({
    id: lead.id,
    city: lead.city,
    projectType: lead.projectType,
    budgetMin: lead.budgetMin,
    budgetMax: lead.budgetMax,
    plotSize: lead.plotSize,
    styleTags: normalizeStringArray(lead.preferredStyles),
    timeline: lead.timeline,
    familySize: lead.familySize,
    createdAt: lead.createdAt,
    avoraScore: latestAvoraByUser.get(lead.id) ?? null,
  }));

  return res.status(200).json(payload);
});

export const expressInterestInLead = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.user?.id;
  if (!architectId) throw new AppError("Unauthorized", 401);

  const homeownerId = String(req.params.userId || "").trim();
  if (!homeownerId) throw new AppError("Lead user id is required", 400);

  const [architect, homeowner] = await Promise.all([
    prisma.user.findUnique({
      where: { id: architectId },
      select: { id: true, role: true, city: true, location: true, slug: true, name: true },
    }),
    prisma.user.findUnique({
      where: { id: homeownerId },
      select: { id: true, role: true, onboardingCompleted: true },
    }),
  ]);

  if (!architect || architect.role !== "ARCHITECT") {
    throw new AppError("Architect not found", 404);
  }
  if (!homeowner || homeowner.role !== "CLIENT" || !homeowner.onboardingCompleted) {
    throw new AppError("Lead not found", 404);
  }

  const architectCity =
    architect.city ||
    (architect.location ? architect.location.split(",")[0]?.trim() : "your city") ||
    "your city";

  // Non-fatal: notification failure must not fail the lead-interest action.
  // createAndEmitNotification already handles errors internally (log and continue).
  await createAndEmitNotification({
    userId: homeowner.id,
    type: "lead_interest",
    title: "New Architect Interest",
    message: `An architect in ${architectCity} is interested in your project`,
    metadata: {
      architectId: architect.id,
      architectSlug: architect.slug ?? architect.id,
      architectName: architect.name ?? "Architect",
    },
  });

  return res.status(201).json({ ok: true });
});

import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

const normalizeArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
};

const normalizePortfolioProject = (project: any) => {
  const images = normalizeArray(project.images);
  return {
    _id: project.id,
    id: project.id,
    title: project.title,
    description: project.description,
    images,
    image: images[0] || "",
    location: project.location || "",
    year: project.year || "",
    area: project.area || "",
    style: project.style || "",
    projectType: project.projectType || "",
    clientName: project.clientName || "",
    featured: Boolean(project.featured),
  };
};

const baseArchitectSelect = {
  id: true,
  name: true,
  email: true,
  avatar: true,
  slug: true,
  firmName: true,
  coaRegistrationNumber: true,
  gstNumber: true,
  yearsOfExperience: true,
  state: true,
  city: true,
  location: true,
  specialty: true,
  startingPrice: true,
  experience: true,
  teamSize: true,
  heroImage: true,
  profileImage: true,
  profilePhoto: true,
  about: true,
  isVerified: true,
  isFeatured: true,
  consultationFee: true,
  startingProjectBudget: true,
  maximumProjectBudget: true,
  rating: true,
  completedProjects: true,
  reviewCount: true,
  trustScore: true,
  onlineConsultation: true,
  offlineConsultation: true,
  siteVisitAvailable: true,
  expertise: true,
  designStyles: true,
  workingStyles: true,
  projectTypes: true,
  citiesServed: true,
  serviceCities: true,
  servicesOffered: true,
  portfolioImages: true,
  awards: true,
  certifications: true,
  profileCompletionPercentage: true,
  onboardingCompleted: true,
  createdAt: true,
} as const;

const normalizeArchitect = (architect: Record<string, unknown>) => {
  const designStyles = normalizeArray(architect.designStyles);
  const workingStyles = normalizeArray(architect.workingStyles);
  const citiesServed = normalizeArray(architect.citiesServed);
  const serviceCities = normalizeArray(architect.serviceCities);
  const expertise = normalizeArray(architect.expertise);
  const servicesOffered = normalizeArray(architect.servicesOffered);
  const projectTypes = normalizeArray(architect.projectTypes);
  const portfolioImages = normalizeArray(architect.portfolioImages);
  const awards = normalizeArray(architect.awards);
  const certifications = normalizeArray(architect.certifications);
  const portfolioProjects = Array.isArray(architect.portfolioProjects) ? architect.portfolioProjects.map(normalizePortfolioProject) : [];

  return {
    ...architect,
    _id: architect.id,
    projects: portfolioProjects,
    portfolioProjects,
    profileImage: (architect.profileImage || architect.profilePhoto || architect.avatar || architect.heroImage || "") as string,
    isVerified: Boolean(architect.isVerified),
    isFeatured: Boolean(architect.isFeatured),
    consultationFee: (architect.consultationFee as number | null | undefined) ?? 0,
    rating: (architect.rating as number | null | undefined) ?? 0,
    completedProjects: (architect.completedProjects as number | null | undefined) ?? 0,
    reviewCount: (architect.reviewCount as number | null | undefined) ?? 0,
    trustScore: (architect.trustScore as number | null | undefined) ?? 0,
    designStyles: designStyles.length ? designStyles : workingStyles,
    workingStyles: workingStyles.length ? workingStyles : designStyles,
    projectTypes,
    citiesServed: citiesServed.length ? citiesServed : serviceCities,
    serviceCities: serviceCities.length ? serviceCities : citiesServed,
    servicesOffered: servicesOffered.length ? servicesOffered : expertise,
    expertise: expertise.length ? expertise : servicesOffered,
    portfolioImages,
    awards,
    certifications,
    profileCompletionPercentage: (architect.profileCompletionPercentage as number | null | undefined) ?? 0,
    createdAt: (architect.createdAt as Date | string | undefined) ?? new Date().toISOString(),
  };
};

export const getArchitects = asyncHandler(async (req: Request, res: Response) => {
  // Grab query params for filtering (e.g., ?minRating=4&maxBudget=500000)
  const { minRating, minBudget, maxBudget, city, style, projectType, verified, featured } = req.query;

  // Prisma query to find all architects
  const architects = await prisma.user.findMany({
    where: {
      role: "ARCHITECT",
      onboardingCompleted: true,
    },
    select: {
      ...baseArchitectSelect,
      portfolioProjects: {
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const matchesText = (value: unknown, needle: string) => normalizeArray(value).some((item) => item.toLowerCase().includes(needle));
  const locationNeedle = String(city || "").trim().toLowerCase();
  const styleNeedle = String(style || "").trim().toLowerCase();
  const projectTypeNeedle = String(projectType || "").trim().toLowerCase();

  const filteredArchitects = architects.filter((architect) => {
    const rating = Number(architect.rating ?? 0);
    const startingBudget = Number(architect.startingProjectBudget ?? architect.startingPrice ?? 0);
    const maximumBudget = Number(architect.maximumProjectBudget ?? architect.consultationFee ?? 0);
    const cityMatch = !locationNeedle || [architect.city, architect.state, architect.location].some((entry) => String(entry || "").toLowerCase().includes(locationNeedle)) || matchesText(architect.serviceCities, locationNeedle) || matchesText(architect.citiesServed, locationNeedle);
    const styleMatch = !styleNeedle || matchesText(architect.workingStyles, styleNeedle) || matchesText(architect.designStyles, styleNeedle);
    const projectMatch = !projectTypeNeedle || matchesText(architect.expertise, projectTypeNeedle) || matchesText(architect.servicesOffered, projectTypeNeedle) || matchesText(architect.projectTypes, projectTypeNeedle) || String(architect.specialty || "").toLowerCase().includes(projectTypeNeedle);
    const verifiedMatch = verified === undefined || verified === null ? true : String(verified) === "true" ? Boolean(architect.isVerified) : true;
    const featuredMatch = featured === undefined || featured === null ? true : String(featured) === "true" ? Boolean(architect.isFeatured) : true;
    const ratingMatch = !minRating || rating >= Number(minRating);
    const budgetMinMatch = !minBudget || maximumBudget >= Number(minBudget);
    const budgetMaxMatch = !maxBudget || startingBudget <= Number(maxBudget);
    return cityMatch && styleMatch && projectMatch && verifiedMatch && featuredMatch && ratingMatch && budgetMinMatch && budgetMaxMatch;
  });

  res.status(200).json(filteredArchitects.map(normalizeArchitect));
});

// Add this new function to fetch a single architect by their slug
export const getArchitectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  // Support lookup by slug first, then fall back to id — this lets
  // notification metadata use either architectSlug or architectId.
  const architect = await prisma.user.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    select: {
      ...baseArchitectSelect,
      portfolioProjects: {
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!architect) {
    res.status(404).json({ error: "Architect not found" });
    return;
  }

  // Format it for the frontend (mapping id to _id)
  res.status(200).json(normalizeArchitect(architect as unknown as Record<string, unknown>));
});

export const getMyArchitect = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const architect = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      ...baseArchitectSelect,
      portfolioProjects: true,
    }
  });

  if (!architect) return res.status(404).json({ error: 'Architect profile not found' });

  res.status(200).json(normalizeArchitect(architect as unknown as Record<string, unknown>));
});

export const getMyArchitectStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const [totalRequests, acceptedRequests, closedRequests, monthlyEarnings, totalEarnings] = await Promise.all([
    prisma.consultation.count({ where: { architectId: userId } }),
    prisma.consultation.count({ where: { architectId: userId, status: 'ACCEPTED' } }),
    prisma.consultation.count({ where: { architectId: userId, status: 'COMPLETED' } }),
    prisma.payment.aggregate({ where: { payeeId: userId, status: 'PAID' }, _sum: { amount: true } }).then(r => (r._sum.amount ?? 0)),
    prisma.payment.aggregate({ where: { payeeId: userId, status: 'PAID' }, _sum: { amount: true } }).then(r => (r._sum.amount ?? 0)),
  ]);

  res.status(200).json({ totalRequests, acceptedRequests, closedRequests, monthlyEarnings, totalEarnings, thisMonthRequests: 0 });
});

import { getStudioInsights } from "../services/ai/studioInsight.service.js";

export const getMyArchitectInsights = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const insights = await getStudioInsights(userId);
  res.status(200).json(insights);
});

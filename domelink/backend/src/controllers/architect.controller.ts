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

export const getArchitects = asyncHandler(async (req: Request, res: Response) => {
  // Grab query params for filtering (e.g., ?minRating=4&maxBudget=500000)
  const { minRating, minBudget, maxBudget } = req.query;

  // Prisma query to find all architects
  const architects = await prisma.user.findMany({
    where: {
      role: "ARCHITECT"
      // (Keep your other filter logic here for budget/rating)
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      slug: true,           // Add this!
      location: true,       // Add this!
      specialty: true,      // Add this!
      startingPrice: true,  // Add this!
      experience: true,     // Add this!
      teamSize: true,       // Add this!
      heroImage: true,      // Add this!
      about: true,          // Add this!
      profileImage: true,
      isVerified: true,
      isFeatured: true,
      consultationFee: true,
      rating: true,
      completedProjects: true,
      reviewCount: true,
      trustScore: true,
      designStyles: true,
      projectTypes: true,
      citiesServed: true,
      servicesOffered: true,
      portfolioProjects: {
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      },
    }
  });

  const formattedArchitects = architects.map((arch) => {
    const projects = arch.portfolioProjects.map(normalizePortfolioProject);
    return {
      ...arch,
      _id: arch.id, // Map Postgres 'id' to React's expected '_id'
      projects,
      portfolioProjects: projects,
      profileImage: arch.profileImage || arch.avatar || arch.heroImage || "",
      isVerified: Boolean(arch.isVerified),
      isFeatured: Boolean(arch.isFeatured),
      consultationFee: arch.consultationFee ?? 0,
      rating: arch.rating ?? 0,
      completedProjects: arch.completedProjects ?? 0,
      reviewCount: arch.reviewCount ?? 0,
      trustScore: arch.trustScore ?? 0,
      designStyles: normalizeArray(arch.designStyles),
      projectTypes: normalizeArray(arch.projectTypes),
      citiesServed: normalizeArray(arch.citiesServed),
      servicesOffered: normalizeArray(arch.servicesOffered),
    };
  });

  res.status(200).json(formattedArchitects);
});

// Add this new function to fetch a single architect by their slug
export const getArchitectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const architect = await prisma.user.findUnique({
    where: { 
      slug: slug,
      // role: "ARCHITECT" // Optional: ensures we only fetch architects
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      slug: true,
      location: true,
      specialty: true,
      startingPrice: true,
      experience: true,
      teamSize: true,
      heroImage: true,
      about: true,
      profileImage: true,
      isVerified: true,
      isFeatured: true,
      consultationFee: true,
      rating: true,
      completedProjects: true,
      reviewCount: true,
      trustScore: true,
      designStyles: true,
      projectTypes: true,
      citiesServed: true,
      servicesOffered: true,
      portfolioProjects: {
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      }
    }
  });

  if (!architect) {
    res.status(404).json({ error: "Architect not found" });
    return;
  }

  // Format it for the frontend (mapping id to _id)
  const formattedArchitect = {
    ...architect,
    _id: architect.id,
    projects: architect.portfolioProjects.map(normalizePortfolioProject),
    portfolioProjects: architect.portfolioProjects.map(normalizePortfolioProject),
    profileImage: architect.profileImage || architect.avatar || architect.heroImage || "",
    isVerified: Boolean(architect.isVerified),
    isFeatured: Boolean(architect.isFeatured),
    consultationFee: architect.consultationFee ?? 0,
    rating: architect.rating ?? 0,
    completedProjects: architect.completedProjects ?? 0,
    reviewCount: architect.reviewCount ?? 0,
    trustScore: architect.trustScore ?? 0,
    designStyles: normalizeArray(architect.designStyles),
    projectTypes: normalizeArray(architect.projectTypes),
    citiesServed: normalizeArray(architect.citiesServed),
    servicesOffered: normalizeArray(architect.servicesOffered),
  };

  res.status(200).json(formattedArchitect);
});

export const getMyArchitect = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const architect = await prisma.user.findUnique({ where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      slug: true,
      location: true,
      specialty: true,
      startingPrice: true,
      experience: true,
      teamSize: true,
      heroImage: true,
      about: true,
      profileImage: true,
      isVerified: true,
      isFeatured: true,
      consultationFee: true,
      rating: true,
      completedProjects: true,
      reviewCount: true,
      trustScore: true,
      designStyles: true,
      projectTypes: true,
      citiesServed: true,
      servicesOffered: true,
      portfolioProjects: true,
    }
  });

  if (!architect) return res.status(404).json({ error: 'Architect profile not found' });

  const formatted = {
    ...architect,
    _id: architect.id,
    projects: (architect as any).portfolioProjects.map(normalizePortfolioProject),
    portfolioProjects: (architect as any).portfolioProjects.map(normalizePortfolioProject),
    profileImage: architect.profileImage || architect.avatar || architect.heroImage || "",
  };
  res.status(200).json(formatted);
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
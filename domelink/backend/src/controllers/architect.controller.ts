import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

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
    }
  });

  const formattedArchitects = architects.map(arch => ({
    ...arch,
    _id: arch.id // Map Postgres 'id' to React's expected '_id'
  }));

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
      about: true
    }
  });

  if (!architect) {
    res.status(404).json({ error: "Architect not found" });
    return;
  }

  // Format it for the frontend (mapping id to _id)
  const formattedArchitect = {
    ...architect,
    _id: architect.id
  };

  res.status(200).json(formattedArchitect);
});
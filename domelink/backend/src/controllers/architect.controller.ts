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
      role: "ARCHITECT",
      // Add more dynamic filters here based on your specific Prisma schema
      // e.g., budget: { gte: Number(minBudget) }
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      // Select any other architect-specific fields like specialty, rating, etc.
    },
  });

  res.status(200).json(architects);
});

export const getArchitectBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = req.params; // Assuming you use 'id' as the slug for now, or add a slug field
  
  const architect = await prisma.user.findFirst({
    where: { 
      role: "ARCHITECT",
      id: slug // Update this if you have an actual 'slug' field
    },
  });

  if (!architect) {
    return res.status(404).json({ message: "Architect not found" });
  }

  res.status(200).json(architect);
});
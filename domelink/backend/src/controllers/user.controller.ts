import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

const prisma = new PrismaClient();

// ==========================================
// 1. Get Current User Profile
// ==========================================
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError("Unauthorized - No user ID found in token", 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      location: true,
      specialty: true,
      startingPrice: true,
      experience: true,
      teamSize: true,
      heroImage: true,
      about: true,
      slug: true,
    }
  });

  if (!user) {
    throw new AppError("User not found in database", 404);
  }

  res.status(200).json({ 
    user,
    consultationCount: 0, 
    earnings: 0           
  });
});

// ==========================================
// 2. Update Current User Profile
// ==========================================
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const updateData = { ...req.body };

  // The Magic Slug Generator for Architects!
  if (req.user?.role === "ARCHITECT" && updateData.name) {
    updateData.slug = updateData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replaces spaces and special chars with hyphens
      .replace(/(^-|-$)+/g, '');   // Trims hyphens from start/end
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  res.status(200).json({ user: updatedUser });
});

// ==========================================
// 3. Get Saved Architects (Placeholder)
// ==========================================
export const getSavedArchitects = asyncHandler(async (req: Request, res: Response) => {
  // Returning an empty array for now so the Explore page doesn't crash
  // We will build out the Prisma database relation for this later
  res.status(200).json([]);
});

// ==========================================
// 4. Save an Architect (Placeholder)
// ==========================================
export const saveArchitect = asyncHandler(async (req: Request, res: Response) => {
  const { architectId } = req.params;
  // TODO: Add Prisma logic to save this architect to the user's saved list
  res.status(200).json({ ok: true, message: `Architect ${architectId} saved!` });
});

// ==========================================
// 5. Unsave an Architect (Placeholder)
// ==========================================
export const unsaveArchitect = asyncHandler(async (req: Request, res: Response) => {
  const { architectId } = req.params;
  // TODO: Add Prisma logic to remove this architect from the user's saved list
  res.status(200).json({ ok: true, message: `Architect ${architectId} unsaved!` });
});
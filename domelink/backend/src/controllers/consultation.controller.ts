import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

export const getMyConsultations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Determine if we are querying for a homeowner or an architect
  const whereClause = userRole === "ARCHITECT" 
    ? { architectId: userId } 
    : { userId: userId };

  const consultations = await prisma.consultation.findMany({
    where: whereClause,
    include: {
      // Bring in the details of both parties so the UI can show names/avatars
      user: { select: { id: true, name: true, avatar: true } },
      architect: { select: { id: true, name: true, avatar: true } }, // Adjust to match your schema relation names
    },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(consultations);
});

export const createConsultation = asyncHandler(async (req: Request, res: Response) => {
  const { architectId, message, projectType } = req.body;
  const userId = req.user?.id;

  if (!userId || !architectId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const consultation = await prisma.consultation.create({
    data: {
      userId,
      architectId,
      message,
      projectType,
      status: "pending",
      amount: 0, // Default or calculated amount
    },
  });

  res.status(201).json(consultation);
});
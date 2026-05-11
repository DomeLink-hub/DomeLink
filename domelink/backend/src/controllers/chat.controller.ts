import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";

const prisma = new PrismaClient();

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId } = req.params;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  // First, verify the user is actually part of this consultation to prevent snooping
  const consultation = await prisma.consultation.findUnique({
    where: { id: consultationId },
  });

  if (!consultation || (consultation.userId !== userId && consultation.architectId !== userId)) {
    return res.status(403).json({ message: "Access denied to this chat" });
  }

  // Fetch the messages
  const messages = await prisma.chatMessage.findMany({
    where: { consultationId },
    include: {
      sender: {
        select: { id: true, name: true, role: true, avatar: true },
      },
    },
    orderBy: { timestamp: "asc" }, // Oldest first, so it scrolls down to newest
  });

  res.status(200).json(messages);
});

// Optional: Grouped chat endpoint if your frontend api.getChatGrouped relies on it
export const getChatGrouped = asyncHandler(async (req: Request, res: Response) => {
    // Implement grouping logic here, or just let the frontend group the standard history
    // For now, redirecting to the standard history is a safe fallback
    res.redirect(`/api/chat/${req.params.consultationId}`);
});
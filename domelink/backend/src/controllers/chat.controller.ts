import type { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { asyncHandler } from "../utils/asyncHandler.js";
import { AppError } from "../utils/AppError.js";

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

export const getChatConversations = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userRole = req.user?.role;

  if (!userId || !userRole) {
    throw new AppError("Unauthorized", 401);
  }

  const whereClause = userRole === "ARCHITECT" ? { architectId: userId } : { userId };

  const consultations = await prisma.consultation.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          city: true,
          projectType: true,
        },
      },
      architect: {
        select: {
          id: true,
          name: true,
          avatar: true,
          role: true,
          city: true,
          specialty: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const payload = await Promise.all(
    consultations.map(async (consultation) => {
      const [latestMessage, unreadCandidates] = await Promise.all([
        prisma.chatMessage.findFirst({
          where: { consultationId: consultation.id },
          include: {
            sender: {
              select: { id: true, name: true, role: true, avatar: true },
            },
          },
          orderBy: { timestamp: "desc" },
        }),
        prisma.chatMessage.findMany({
          where: { consultationId: consultation.id, senderId: { not: userId } },
          select: { id: true, readBy: true },
        }),
      ]);

      const unreadCount = unreadCandidates.filter((message) => {
        const readBy = Array.isArray(message.readBy) ? message.readBy : [];
        return !readBy.some((entry) => {
          const candidate = entry as { userId?: string };
          return candidate.userId === userId;
        });
      }).length;

      return {
        _id: consultation.id,
        id: consultation.id,
        status: consultation.status,
        projectType: consultation.projectType,
        createdAt: consultation.createdAt,
        updatedAt: consultation.updatedAt,
        user: consultation.user,
        architect: consultation.architect,
        lastMessage: latestMessage
          ? {
              id: latestMessage.id,
              message: latestMessage.message,
              timestamp: latestMessage.timestamp,
              sender: latestMessage.sender,
            }
          : null,
        unreadCount,
      };
    }),
  );

  payload.sort((a, b) => {
    const aTs = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp).getTime() : new Date(a.updatedAt).getTime();
    const bTs = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp).getTime() : new Date(b.updatedAt).getTime();
    return bTs - aTs;
  });

  res.status(200).json(payload);
});

export const sendChatMessage = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId } = req.params;
  const userId = req.user?.id;
  const message = String(req.body?.message || "").trim();

  if (!userId) throw new AppError("Unauthorized", 401);
  if (!message) throw new AppError("Message is required", 400);

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation) throw new AppError("Consultation not found", 404);

  if (consultation.userId !== userId && consultation.architectId !== userId) {
    throw new AppError("Access denied to this chat", 403);
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      consultationId,
      senderId: userId,
      message,
      readBy: [{ userId, readAt: new Date().toISOString() }],
    },
    include: {
      sender: {
        select: { id: true, name: true, role: true, avatar: true },
      },
    },
  });

  res.status(201).json(chatMessage);
});

export const markChatRead = asyncHandler(async (req: Request, res: Response) => {
  const { consultationId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new AppError("Unauthorized", 401);

  const consultation = await prisma.consultation.findUnique({ where: { id: consultationId } });
  if (!consultation) throw new AppError("Consultation not found", 404);

  if (consultation.userId !== userId && consultation.architectId !== userId) {
    throw new AppError("Access denied to this chat", 403);
  }

  const messages = await prisma.chatMessage.findMany({
    where: { consultationId, senderId: { not: userId } },
    select: { id: true, readBy: true },
  });

  let updatedCount = 0;
  for (const message of messages) {
    const readBy = Array.isArray(message.readBy) ? [...message.readBy] : [];
    const alreadyRead = readBy.some((entry) => {
      const candidate = entry as { userId?: string };
      return candidate.userId === userId;
    });

    if (!alreadyRead) {
      readBy.push({ userId, readAt: new Date().toISOString() });
      await prisma.chatMessage.update({ where: { id: message.id }, data: { readBy } });
      updatedCount += 1;
    }
  }

  res.status(200).json({ updatedCount });
});

// Optional: Grouped chat endpoint if your frontend api.getChatGrouped relies on it
export const getChatGrouped = asyncHandler(async (req: Request, res: Response) => {
    // Implement grouping logic here, or just let the frontend group the standard history
    // For now, redirecting to the standard history is a safe fallback
    res.redirect(`/api/chat/${req.params.consultationId}`);
});
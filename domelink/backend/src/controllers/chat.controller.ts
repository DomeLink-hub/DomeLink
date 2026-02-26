import type { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { ChatMessageModel } from "../models/ChatMessage.js";
import { ConsultationModel } from "../models/Consultation.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { io } from "../socket.js";

const postMessageSchema = z.object({
  message: z.string().min(1),
});

const assertAccess = async (consultationId: string, userId: string) => {
  const consultation = await ConsultationModel.findById(consultationId);
  if (!consultation) {
    throw new AppError("Consultation not found", 404);
  }

  const isHomeowner = String(consultation.userId) === userId;
  const isArchitectOwner = Boolean(
    await ArchitectModel.exists({
      _id: consultation.architectId,
      createdBy: userId,
    }),
  );
  const isOwner = isHomeowner || isArchitectOwner;
  if (!isOwner) {
    throw new AppError("Forbidden", 403);
  }

  return consultation;
};

export const getChatMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  await assertAccess(req.params.consultationId, req.auth.sub);

  const messages = await ChatMessageModel.find({ consultationId: req.params.consultationId })
    .populate("senderId", "name role avatar")
    .sort({ timestamp: 1 });

  res.status(200).json(messages);
});

export const getGroupedChatMessages = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  await assertAccess(req.params.consultationId, req.auth.sub);

  const messages = await ChatMessageModel.find({ consultationId: req.params.consultationId })
    .populate("senderId", "name role avatar")
    .sort({ timestamp: 1 })
    .lean();

  const grouped = messages.reduce<Array<{ date: string; messages: typeof messages }>>((acc, message) => {
    const date = new Date(message.timestamp).toISOString().slice(0, 10);
    const last = acc[acc.length - 1];
    if (!last || last.date !== date) {
      acc.push({ date, messages: [message] });
      return acc;
    }
    last.messages.push(message);
    return acc;
  }, []);

  res.status(200).json({
    consultationId: req.params.consultationId,
    grouped,
  });
});

export const postChatMessage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  await assertAccess(req.params.consultationId, req.auth.sub);
  const payload = postMessageSchema.parse(req.body);

  const message = await ChatMessageModel.create({
    consultationId: req.params.consultationId,
    senderId: req.auth.sub,
    message: payload.message,
    timestamp: new Date(),
    readBy: [{ userId: req.auth.sub, readAt: new Date() }],
  });

  const hydratedMessage = await ChatMessageModel.findById(message._id)
    .populate("senderId", "name role avatar")
    .lean();

  if (!hydratedMessage) {
    throw new AppError("Unable to load created message", 500);
  }

  if (io) {
    io.to(req.params.consultationId).emit("message", hydratedMessage);
  }

  res.status(201).json(hydratedMessage);
});

export const markChatAsRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) {
    throw new AppError("Unauthorized", 401);
  }

  await assertAccess(req.params.consultationId, req.auth.sub);

  const unreadMessages = await ChatMessageModel.find({
    consultationId: req.params.consultationId,
    senderId: { $ne: req.auth.sub },
    "readBy.userId": { $ne: req.auth.sub },
  }).select("_id");

  if (unreadMessages.length > 0) {
    await ChatMessageModel.updateMany(
      { _id: { $in: unreadMessages.map((message) => message._id) } },
      {
        $push: {
          readBy: {
            userId: req.auth.sub,
            readAt: new Date(),
          },
        },
      },
    );
  }

  if (io) {
    io.to(req.params.consultationId).emit("messages_read", {
      consultationId: req.params.consultationId,
      userId: req.auth.sub,
      messageIds: unreadMessages.map((message) => String(message._id)),
    });
  }

  res.status(200).json({ updatedCount: unreadMessages.length });
});

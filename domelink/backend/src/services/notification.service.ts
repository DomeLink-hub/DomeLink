import prisma from "../config/prisma.js";
import { emitToUserRoom } from "../socket.js";
import { logger } from "../utils/logger.js";

export type NotificationCreateInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export const createAndEmitNotification = async ({ userId, type, title, message, metadata }: NotificationCreateInput) => {
  let notification: { id: string; createdAt: Date } | null = null;

  try {
    notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        body: message,
        read: false,
        ...(metadata ? { metadata: metadata as object } : {}),
      },
      select: { id: true, createdAt: true },
    });
  } catch (err: any) {
    // Non-fatal: the parent action already succeeded. Log and continue.
    logger.warn("Prisma error in createAndEmitNotification — notification not persisted", {
      error: err.message,
      userId,
      type,
    });
  }

  // Always emit via Socket.io regardless of whether the DB write succeeded
  emitToUserRoom(userId, "notification", {
    id: notification?.id ?? null,
    message,
    type,
    metadata: metadata ?? null,
    createdAt: notification?.createdAt ?? new Date(),
  });

  return notification;
};

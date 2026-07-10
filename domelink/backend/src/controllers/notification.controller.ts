import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const safelyParseJson = (data: any) => {
  try {
    return JSON.parse(data);
  } catch (e) {
    return null;
  }
};

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  // Shape matches the old Mongo response: rename userId→user, add _id alias
  res.status(200).json(
    notifications.map((n) => ({
      _id: n.id,
      id: n.id,
      user: n.userId,
      type: n.type,
      title: n.title,
      body: n.body,
      read: n.read,
      metadata: (n as any).metadata ? (typeof (n as any).metadata === "string" ? safelyParseJson((n as any).metadata) : (n as any).metadata) : null,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    })),
  );
});

export const getNotificationCount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const unreadCount = await prisma.notification.count({
    where: { userId, read: false },
  });

  res.status(200).json({ unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const { notificationId } = req.params;

  const existing = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!existing) throw new AppError("Notification not found", 404);

  const notification = await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });

  res.status(200).json({
    _id: notification.id,
    id: notification.id,
    user: notification.userId,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    read: notification.read,
    createdAt: notification.createdAt,
    updatedAt: notification.updatedAt,
  });
});

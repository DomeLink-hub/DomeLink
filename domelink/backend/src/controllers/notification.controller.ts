import { Request, Response } from "express";
import { NotificationModel } from "../models/Notification.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  console.log("[Notification] getNotifications for user:", req.auth.sub);
  const notifications = await NotificationModel.find({ user: req.auth.sub }).sort({ createdAt: -1 });
  res.status(200).json(notifications);
});

export const getNotificationCount = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const unreadCount = await NotificationModel.countDocuments({ user: req.auth.sub, read: false });
  res.status(200).json({ unreadCount });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const { notificationId } = req.params;
  console.log("[Notification] markNotificationRead for user:", req.auth.sub, "notification:", notificationId);
  const notification = await NotificationModel.findOneAndUpdate(
    { _id: notificationId, user: req.auth.sub },
    { $set: { read: true } },
    { new: true }
  );
  if (!notification) throw new AppError("Notification not found", 404);
  res.status(200).json(notification);
});

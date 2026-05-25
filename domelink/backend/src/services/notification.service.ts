import { NotificationModel } from "../models/Notification.js";
import { emitToUserRoom } from "../socket.js";

export type NotificationCreateInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
};

export const createAndEmitNotification = async ({ userId, type, title, message }: NotificationCreateInput) => {
  const notification = await NotificationModel.create({
    user: userId,
    type,
    title,
    body: message,
    read: false,
  });

  emitToUserRoom(userId, "notification", {
    id: String(notification._id),
    message,
    type,
    createdAt: notification.createdAt,
  });

  return notification;
};

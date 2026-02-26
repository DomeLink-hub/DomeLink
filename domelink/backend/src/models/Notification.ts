import { Schema, model } from "mongoose";

export interface NotificationDocument {
  user: Schema.Types.ObjectId;
  type: "message" | "project" | "review" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["message", "project", "review", "system"], required: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const NotificationModel = model<NotificationDocument>("Notification", notificationSchema);

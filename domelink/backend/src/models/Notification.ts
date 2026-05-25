import mongoose, { Document, Schema } from "mongoose";

export interface NotificationDocument extends Document {
  user: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>(
  {
    user: { type: String, ref: "User", required: true, index: true },
    type: { type: String, default: "system" },
    title: { type: String, default: "" },
    body: { type: String, default: "" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel = mongoose.models.Notification || mongoose.model<NotificationDocument>("Notification", NotificationSchema);

export default NotificationModel;

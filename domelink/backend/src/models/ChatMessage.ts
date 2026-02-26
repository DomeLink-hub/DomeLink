import { Schema, model } from "mongoose";

export interface ChatMessageDocument {
  consultationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  message: string;
  timestamp: Date;
  readBy: Array<{
    userId: Schema.Types.ObjectId;
    readAt: Date;
  }>;
}

const readBySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    readAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const chatMessageSchema = new Schema<ChatMessageDocument>(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: "Consultation", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
    readBy: { type: [readBySchema], default: [] },
  },
  { timestamps: false },
);

chatMessageSchema.index({ consultationId: 1, timestamp: 1 });
chatMessageSchema.index({ senderId: 1, timestamp: -1 });

export const ChatMessageModel = model<ChatMessageDocument>("ChatMessage", chatMessageSchema);

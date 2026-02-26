import { Schema, model } from "mongoose";

export type TeamInviteStatus = "pending" | "accepted" | "expired";

export interface TeamInviteDocument {
  architectId: Schema.Types.ObjectId;
  email: string;
  role: string;
  token: string;
  invitedBy: Schema.Types.ObjectId;
  status: TeamInviteStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const teamInviteSchema = new Schema<TeamInviteDocument>(
  {
    architectId: { type: Schema.Types.ObjectId, ref: "Architect", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    role: { type: String, required: true },
    token: { type: String, required: true, unique: true, index: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted", "expired"], default: "pending", index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

teamInviteSchema.index({ architectId: 1, email: 1, status: 1 });

export const TeamInviteModel = model<TeamInviteDocument>("TeamInvite", teamInviteSchema);

import mongoose, { Document, Schema, Types } from "mongoose";

export interface TeamInviteDocument extends Document {
  architectId: string;
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  status: string;
  expiresAt: Date;
}

const TeamInviteSchema = new Schema<TeamInviteDocument>(
  {
    architectId: { type: String, ref: "User", required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    invitedBy: { type: String, ref: "User" },
    status: { type: String, default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

export const TeamInviteModel = mongoose.models.TeamInvite || mongoose.model<TeamInviteDocument>("TeamInvite", TeamInviteSchema);

export default TeamInviteModel;

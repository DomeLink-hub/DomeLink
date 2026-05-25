import mongoose, { Document, Schema, Types } from "mongoose";

export interface TeamMemberDocument extends Document {
  architectId: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status?: string;
}

const TeamMemberSchema = new Schema<TeamMemberDocument>(
  {
    architectId: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String },
    status: { type: String, default: "offline" },
  },
  { timestamps: true },
);

export const TeamMemberModel = mongoose.models.TeamMember || mongoose.model<TeamMemberDocument>("TeamMember", TeamMemberSchema);

export default TeamMemberModel;

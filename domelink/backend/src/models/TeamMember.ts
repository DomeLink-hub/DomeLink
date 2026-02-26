import { Schema, model } from "mongoose";

export type TeamMemberStatus = "online" | "offline" | "away";

export interface TeamMemberDocument {
  architectId: Schema.Types.ObjectId;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  status: TeamMemberStatus;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    architectId: { type: Schema.Types.ObjectId, ref: "Architect", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    avatar: { type: String },
    status: { type: String, enum: ["online", "offline", "away"], default: "offline" },
  },
  { timestamps: true },
);

export const TeamMemberModel = model<TeamMemberDocument>("TeamMember", teamMemberSchema);

import { Schema, model } from "mongoose";

export type UserRole = "homeowner" | "architect" | "admin";
export type UserStatus = "active" | "suspended";

export interface UserDocument {
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  tokenVersion: number;
  passwordHash: string;
  savedArchitects: Schema.Types.ObjectId[];
  styleTags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ["homeowner", "architect", "admin"],
      default: "homeowner",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
      required: true,
    },
    avatar: { type: String },
    tokenVersion: { type: Number, default: 0, required: true },
    passwordHash: { type: String, required: true, select: false },
    savedArchitects: [{ type: Schema.Types.ObjectId, ref: "Architect", default: [] }],
    styleTags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>("User", userSchema);

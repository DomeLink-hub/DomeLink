import mongoose, { Document, Schema } from "mongoose";

export interface SavedArchitectDocument extends Document {
  userId: string;
  architectId: string;
  collectionName?: string;
  createdAt?: Date;
}

const SavedArchitectSchema = new Schema<SavedArchitectDocument>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    architectId: { type: String, ref: "Architect", required: true, index: true },
    collectionName: { type: String, default: "" },
  },
  { timestamps: true },
);

SavedArchitectSchema.index({ userId: 1, architectId: 1 }, { unique: true });

export const SavedArchitectModel = mongoose.models.SavedArchitect || mongoose.model<SavedArchitectDocument>("SavedArchitect", SavedArchitectSchema);

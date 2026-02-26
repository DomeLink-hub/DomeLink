import { Schema, model } from "mongoose";

export interface SavedArchitectDocument {
  userId: Schema.Types.ObjectId;
  architectId: Schema.Types.ObjectId;
  createdAt: Date;
}

const savedArchitectSchema = new Schema<SavedArchitectDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    architectId: { type: Schema.Types.ObjectId, ref: "Architect", required: true, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

savedArchitectSchema.index({ userId: 1, architectId: 1 }, { unique: true });

export const SavedArchitectModel = model<SavedArchitectDocument>("SavedArchitect", savedArchitectSchema);

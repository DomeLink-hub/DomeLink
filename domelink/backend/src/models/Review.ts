import mongoose, { Document, Schema } from "mongoose";

export interface ReviewDocument extends Document {
  project?: string;
  reviewer: string;
  reviewee: string;
  rating: number;
  comment: string;
  createdAt?: Date;
}

const ReviewSchema = new Schema<ReviewDocument>(
  {
    project: { type: String },
    reviewer: { type: String, ref: "User", required: true, index: true },
    reviewee: { type: String, ref: "Architect", required: true, index: true },
    rating: { type: Number, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true },
);

export const ReviewModel = mongoose.models.Review || mongoose.model<ReviewDocument>("Review", ReviewSchema);

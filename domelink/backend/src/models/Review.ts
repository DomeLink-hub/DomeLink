import { Schema, model } from "mongoose";

export interface ReviewDocument {
  project: Schema.Types.ObjectId;
  reviewer: Schema.Types.ObjectId;
  reviewee: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<ReviewDocument>({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  reviewer: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reviewee: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ReviewModel = model<ReviewDocument>("Review", reviewSchema);

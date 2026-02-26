import { Schema, model } from "mongoose";

export interface AnalyticsEventDocument {
  userId: Schema.Types.ObjectId;
  event: "profile_view" | "consultation_start" | "save" | "search_filter";
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const analyticsEventSchema = new Schema<AnalyticsEventDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    event: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

analyticsEventSchema.index({ event: 1, createdAt: -1 });

export const AnalyticsEventModel = model<AnalyticsEventDocument>("AnalyticsEvent", analyticsEventSchema);

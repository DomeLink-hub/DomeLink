import { Schema, model } from "mongoose";

export type ConsultationStatus = "pending" | "active" | "closed" | "accepted" | "completed" | "rejected";

export interface ConsultationDocument {
  userId: Schema.Types.ObjectId;
  architectId: Schema.Types.ObjectId;
  message: string;
  preferredDate?: Date;
  projectType?: string;
  budget?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
  status: ConsultationStatus;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<ConsultationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    architectId: { type: Schema.Types.ObjectId, ref: "Architect", required: true },
    message: { type: String, required: true },
    preferredDate: { type: Date },
    projectType: { type: String },
    budget: { type: Number },
    plotSize: { type: String },
    preferredStyle: { type: String },
    location: { type: String },
    status: {
      type: String,
      enum: ["pending", "active", "closed", "accepted", "completed", "rejected"],
      default: "pending",
      required: true,
    },
    amount: { type: Number, default: 49, required: true },
  },
  { timestamps: true },
);

consultationSchema.index({ userId: 1, architectId: 1, status: 1 });
consultationSchema.index({ createdAt: -1 });
consultationSchema.index({ architectId: 1, status: 1, createdAt: -1 });
consultationSchema.index({ userId: 1, status: 1, createdAt: -1 });

export const ConsultationModel = model<ConsultationDocument>("Consultation", consultationSchema);

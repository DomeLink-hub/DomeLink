import mongoose, { Document, Schema } from "mongoose";

export interface ConsultationDocument extends Document {
  userId: string;
  architectId: string;
  message?: string;
  projectType?: string;
  status: string;
  amount: number;
  preferredDate?: Date;
  budget?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
}

const ConsultationSchema = new Schema<ConsultationDocument>(
  {
    userId: { type: String, ref: "User", required: true, index: true },
    architectId: { type: String, ref: "Architect", required: true, index: true },
    message: { type: String, default: "" },
    projectType: { type: String, default: "" },
    status: { type: String, default: "pending" },
    amount: { type: Number, default: 0 },
    preferredDate: { type: Date },
    budget: { type: Number },
    plotSize: { type: String },
    preferredStyle: { type: String },
    location: { type: String },
  },
  { timestamps: true },
);

export const ConsultationModel = mongoose.models.Consultation || mongoose.model<ConsultationDocument>("Consultation", ConsultationSchema);

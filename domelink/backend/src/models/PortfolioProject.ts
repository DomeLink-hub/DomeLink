import { Schema, model } from "mongoose";

export interface PortfolioProjectDocument {
  architectId: Schema.Types.ObjectId;
  title: string;
  images: string[];
  description: string;
  location?: string;
  year?: string;
  area?: string;
  createdAt: Date;
  updatedAt: Date;
}

const portfolioProjectSchema = new Schema<PortfolioProjectDocument>(
  {
    architectId: { type: Schema.Types.ObjectId, ref: "Architect", required: true, index: true },
    title: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String, required: true },
    location: { type: String },
    year: { type: String },
    area: { type: String },
  },
  { timestamps: true },
);

export const PortfolioProjectModel = model<PortfolioProjectDocument>("PortfolioProject", portfolioProjectSchema);

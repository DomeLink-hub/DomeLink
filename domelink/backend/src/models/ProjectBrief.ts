import mongoose, { Document, Schema } from "mongoose";

export interface ProjectBriefDocument extends Document {
  homeownerId: string;
  projectName: string;
  projectType: string;
  plotSize: string;
  budget: string;
  location: string;
  stylePreferences: string[];
  timeline: string;
  requirements: string;
  inspirationImages: string[];
  status: string;
}

const ProjectBriefSchema = new Schema<ProjectBriefDocument>(
  {
    homeownerId: { type: String, required: true },
    projectName: { type: String, default: "" },
    projectType: { type: String, default: "" },
    plotSize: { type: String, default: "" },
    budget: { type: String, default: "" },
    location: { type: String, default: "" },
    stylePreferences: { type: [String], default: [] },
    timeline: { type: String, default: "" },
    requirements: { type: String, default: "" },
    inspirationImages: { type: [String], default: [] },
    status: { type: String, default: "draft" },
  },
  { timestamps: true },
);

export const ProjectBriefModel = mongoose.models.ProjectBrief || mongoose.model<ProjectBriefDocument>("ProjectBrief", ProjectBriefSchema);

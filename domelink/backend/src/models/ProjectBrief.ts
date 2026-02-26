import { Schema, model } from "mongoose";

export type ProjectBriefType = "residential" | "commercial" | "interior" | "landscape";
export type ProjectBriefStatus = "draft" | "submitted" | "in_progress" | "completed";

export interface ProjectBriefDocument {
  homeownerId: Schema.Types.ObjectId;
  projectName: string;
  projectType: ProjectBriefType;
  plotSize: string;
  budget: string;
  location: string;
  stylePreferences: string[];
  timeline: string;
  requirements: string;
  inspirationImages: string[];
  status: ProjectBriefStatus;
  createdAt: Date;
  updatedAt: Date;
}

const projectBriefSchema = new Schema<ProjectBriefDocument>(
  {
    homeownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectName: { type: String, required: true, trim: true },
    projectType: {
      type: String,
      enum: ["residential", "commercial", "interior", "landscape"],
      required: true,
    },
    plotSize: { type: String, required: true, trim: true },
    budget: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    stylePreferences: { type: [String], default: [] },
    timeline: { type: String, required: true, trim: true },
    requirements: { type: String, required: true, trim: true },
    inspirationImages: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["draft", "submitted", "in_progress", "completed"],
      default: "draft",
      required: true,
    },
  },
  { timestamps: true },
);

projectBriefSchema.index({ homeownerId: 1, status: 1, createdAt: -1 });

export const ProjectBriefModel = model<ProjectBriefDocument>("ProjectBrief", projectBriefSchema);

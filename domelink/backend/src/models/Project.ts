import { Schema, model } from "mongoose";

export interface ProjectDocument {
  owner: Schema.Types.ObjectId;
  architect: Schema.Types.ObjectId;
  title: string;
  description: string;
  status: "draft" | "active" | "completed" | "cancelled";
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
}

const projectSchema = new Schema<ProjectDocument>({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  architect: { type: Schema.Types.ObjectId, ref: "Architect", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, enum: ["draft", "active", "completed", "cancelled"], default: "draft" },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const ProjectModel = model<ProjectDocument>("Project", projectSchema);

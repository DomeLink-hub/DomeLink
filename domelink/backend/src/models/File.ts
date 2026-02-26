import { Schema, model } from "mongoose";



export interface FileDocument {
  project: Schema.Types.ObjectId;
  uploader: Schema.Types.ObjectId; // User or Architect
  uploaderModel: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  createdAt: Date;
}

const fileSchema = new Schema<FileDocument>({
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  uploader: { type: Schema.Types.ObjectId, refPath: "uploaderModel", required: true },
  uploaderModel: { type: String, required: true, enum: ["User", "Architect"] },
  filename: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const FileModel = model<FileDocument>("File", fileSchema);

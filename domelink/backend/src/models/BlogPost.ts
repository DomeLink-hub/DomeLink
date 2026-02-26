import { Schema, model } from "mongoose";


export interface BlogPostDocument {
  author: Schema.Types.ObjectId; // User or Architect
  authorModel: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
}


const blogPostSchema = new Schema<BlogPostDocument>({
  author: { type: Schema.Types.ObjectId, refPath: "authorModel", required: true },
  authorModel: { type: String, required: true, enum: ["User", "Architect"] },
  title: { type: String, required: true },
  content: { type: String, required: true },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export const BlogPostModel = model<BlogPostDocument>("BlogPost", blogPostSchema);

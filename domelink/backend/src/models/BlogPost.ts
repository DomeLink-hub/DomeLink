import mongoose, { Document, Schema, Types } from "mongoose";

export interface BlogPostDocument extends Document {
  author: string;
  title: string;
  content: string;
  tags: string[];
  published: boolean;
  createdAt: Date;
}

const BlogPostSchema = new Schema<BlogPostDocument>(
  {
    author: { type: String, ref: "User", required: true },
    title: { type: String, default: "" },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const BlogPostModel = mongoose.models.BlogPost || mongoose.model<BlogPostDocument>("BlogPost", BlogPostSchema);

export default BlogPostModel;

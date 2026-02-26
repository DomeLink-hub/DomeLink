import type { Request, Response } from "express";
import { BlogPostModel } from "../models/BlogPost.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getBlogPostsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const posts = await BlogPostModel.find({ author: architectId });
  res.status(200).json(posts);
});

export const createBlogPost = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const { title, content, tags, published } = req.body;
  if (!req.auth?.sub) throw new AppError("Unauthorized", 401);
  const post = await BlogPostModel.create({
    author: architectId,
    title,
    content,
    tags,
    published,
    createdAt: new Date(),
  });
  res.status(201).json(post);
});

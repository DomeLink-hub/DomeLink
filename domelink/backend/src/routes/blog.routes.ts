import { Router } from "express";
import { getBlogPostsForArchitect, createBlogPost } from "../controllers/blog.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

import { BlogPostModel } from "../models/BlogPost.js";

export const blogRouter = Router();

// Get blog posts for current user
blogRouter.get("/my", requireAuth, async (req, res) => {
	const userId = req.auth?.sub;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });
	const posts = await BlogPostModel.find({ author: userId });
	res.status(200).json(posts);
});

blogRouter.get("/architect/:architectId", getBlogPostsForArchitect);
blogRouter.post("/architect/:architectId", requireAuth, requireRole(["architect", "admin"]), createBlogPost);

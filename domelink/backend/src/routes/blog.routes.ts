import { Router } from "express";
import { getBlogPostsForArchitect, createBlogPost } from "../controllers/blog.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const blogRouter = Router();

blogRouter.get("/architect/:architectId", getBlogPostsForArchitect);
blogRouter.post("/architect/:architectId", requireAuth, requireRole(["architect", "admin"]), createBlogPost);

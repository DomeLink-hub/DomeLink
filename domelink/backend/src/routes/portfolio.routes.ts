import { Router } from "express";
import {
  createPortfolioProject,
  deletePortfolioProject,
  getPortfolioByArchitect,
  updatePortfolioProject,
} from "../controllers/portfolio.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const portfolioRouter = Router();

portfolioRouter.post("/", requireAuth, requireRole(["architect", "admin"]), createPortfolioProject);
portfolioRouter.get("/:architectId", getPortfolioByArchitect);
portfolioRouter.patch("/:projectId", requireAuth, requireRole(["architect", "admin"]), updatePortfolioProject);
portfolioRouter.delete("/:projectId", requireAuth, requireRole(["architect", "admin"]), deletePortfolioProject);

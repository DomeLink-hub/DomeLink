import { Router } from "express";
import { 
  getPortfolio, 
  createPortfolio, 
  updatePortfolio, 
  deletePortfolio 
} from "../controllers/portfolio.controller.js";
import { authenticate as requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

router.get("/:architectId", getPortfolio);
router.post("/", requireAuth, requireRole("architect"), createPortfolio);
router.patch("/:projectId", requireAuth, requireRole("architect"), updatePortfolio);
router.delete("/:projectId", requireAuth, requireRole("architect"), deletePortfolio);

export default router;
import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";
import { createArchitectOnboarding, getArchitectOnboarding, updateArchitectOnboarding } from "../controllers/architectOnboarding.controller.js";

const router = Router();

router.get("/onboarding", authenticate, requireRole("ARCHITECT"), getArchitectOnboarding);
router.post("/onboarding", authenticate, requireRole("ARCHITECT"), createArchitectOnboarding);
router.patch("/onboarding", authenticate, requireRole("ARCHITECT"), updateArchitectOnboarding);

export default router;
import { Router } from "express";
import { submitHomeownerOnboarding, getOnboardingState } from "../controllers/onboarding.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRole } from "../middleware/role.js";

const router = Router();

// POST /api/onboarding/homeowner
router.post(
  "/homeowner",
  authenticate,
  requireRole("CLIENT"),
  submitHomeownerOnboarding
);

// GET /api/onboarding/me
router.get(
  "/me",
  authenticate,
  getOnboardingState
);

export default router;

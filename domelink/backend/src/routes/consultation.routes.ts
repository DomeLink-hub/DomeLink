import { Router } from "express";
import { acceptConsultation, cancelConsultation, completeConsultation, createConsultation, getMyConsultations, startConsultation, updateConsultationStatus } from "../controllers/consultation.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/my", authenticate, getMyConsultations);
router.post("/", authenticate, createConsultation);
router.patch("/:id/accept", authenticate, acceptConsultation);
router.patch("/:id/start", authenticate, startConsultation);
router.patch("/:id/complete", authenticate, completeConsultation);
router.patch("/:id/cancel", authenticate, cancelConsultation);
router.put("/:id/status", authenticate, updateConsultationStatus);
router.patch("/:id/status", authenticate, updateConsultationStatus);

export default router;
import { Router } from "express";
import { getMyConsultations, createConsultation } from "../controllers/consultation.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/my", authenticate, getMyConsultations);
router.post("/", authenticate, createConsultation);

export default router;
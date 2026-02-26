import { Router } from "express";
import {
	createConsultation,
	getMyConsultations,
	updateConsultationStatus,
} from "../controllers/consultation.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const consultationRouter = Router();

consultationRouter.post("/", requireAuth, requireRole(["homeowner", "admin"]), createConsultation);
consultationRouter.get("/my", requireAuth, getMyConsultations);
consultationRouter.patch(
	"/:consultationId/status",
	requireAuth,
	requireRole(["architect", "admin"]),
	updateConsultationStatus,
);

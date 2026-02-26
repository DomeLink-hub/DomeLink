import { Router } from "express";
import { getSupportTicketsForArchitect, createSupportTicket } from "../controllers/support.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const supportRouter = Router();

supportRouter.get("/architect/:architectId", requireAuth, getSupportTicketsForArchitect);
supportRouter.post("/architect/:architectId", requireAuth, createSupportTicket);

import { Router } from "express";
import { getSupportTicketsForArchitect, createSupportTicket } from "../controllers/support.controller.js";
import { requireAuth } from "../middleware/auth.js";

import { SupportTicketModel } from "../models/SupportTicket.js";


export const supportRouter = Router();
// Get support tickets for current user
supportRouter.get("/my", requireAuth, async (req, res) => {
	const userId = req.auth?.sub;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });
	const tickets = await SupportTicketModel.find({ user: userId });
	res.status(200).json(tickets);
});

supportRouter.get("/architect/:architectId", requireAuth, getSupportTicketsForArchitect);
supportRouter.post("/architect/:architectId", requireAuth, createSupportTicket);

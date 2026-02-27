import { Router } from "express";
import { getPaymentsForArchitect, createPayment } from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

import { PaymentModel } from "../models/Payment.js";

export const paymentRouter = Router();
// Get payments for current user
paymentRouter.get("/my", requireAuth, async (req, res) => {
	const userId = req.auth?.sub;
	if (!userId) return res.status(401).json({ error: "Unauthorized" });
	const payments = await PaymentModel.find({ payer: userId });
	res.status(200).json(payments);
});

paymentRouter.get("/architect/:architectId", requireAuth, getPaymentsForArchitect);
paymentRouter.post("/architect/:architectId", requireAuth, requireRole(["homeowner", "admin"]), createPayment);

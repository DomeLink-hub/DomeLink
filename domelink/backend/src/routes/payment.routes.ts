import { Router } from "express";
import { getPaymentsForArchitect, createPayment } from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const paymentRouter = Router();

paymentRouter.get("/architect/:architectId", requireAuth, getPaymentsForArchitect);
paymentRouter.post("/architect/:architectId", requireAuth, requireRole(["homeowner", "admin"]), createPayment);

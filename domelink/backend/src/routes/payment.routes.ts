import { Router } from "express";
import {
	createBookingOrder,
	createConsultationPayment,
	createFeaturedPlacementPayment,
	createSubscriptionPayment,
	handleRazorpayWebhook,
	getBillingSummary,
	getMyPayments,
	getMyInvoices,
	getPaymentsForArchitect,
	verifyPayment,
	downloadInvoicePdf,
} from "../controllers/payment.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { webhookRateLimiter } from "../middleware/rateLimit.js";

export const paymentRouter = Router();

paymentRouter.get("/my", requireAuth, getMyPayments);
paymentRouter.get("/invoices", requireAuth, getMyInvoices);
paymentRouter.get("/summary", requireAuth, getBillingSummary);
paymentRouter.get("/architect/:architectId", requireAuth, getPaymentsForArchitect);
paymentRouter.post("/create-order", requireAuth, requireRole(["CLIENT", "client", "homeowner", "ADMIN", "SUPERADMIN", "admin"]), createBookingOrder);
paymentRouter.post("/consultation", requireAuth, requireRole(["client", "client", "homeowner", "admin"]), createConsultationPayment);
paymentRouter.post("/subscription", requireAuth, requireRole(["architect", "admin"]), createSubscriptionPayment);
paymentRouter.post("/featured", requireAuth, requireRole(["architect", "admin"]), createFeaturedPlacementPayment);
paymentRouter.post("/webhook", webhookRateLimiter, handleRazorpayWebhook);
paymentRouter.post("/verify", requireAuth, verifyPayment);
paymentRouter.get("/invoices/:invoiceId/pdf", requireAuth, downloadInvoicePdf);

export default paymentRouter;

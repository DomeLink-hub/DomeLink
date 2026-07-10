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
import { requireAuth } from "../middleware/auth.js";
// requireRole is imported from role.ts (not auth.ts).
// role.ts maps lowercase aliases → Prisma enums, then does an exact-case comparison
// against user.role (which is a Prisma enum: CLIENT | ARCHITECT | ADMIN | SUPERADMIN).
// Pass the Prisma enum value directly; role.ts also accepts lowercase aliases via its
// roleMap, so "homeowner" → "CLIENT" and "architect" → "ARCHITECT" still work.
import { requireRole } from "../middleware/role.js";
import { webhookRateLimiter, paymentRateLimiter } from "../middleware/rateLimit.js";

export const paymentRouter = Router();

// Apply payment-specific rate limiter to all payment routes (30 req / 15 min).
// The global apiRateLimiter (200 req / 15 min) also applies from app.ts,
// but payment endpoints warrant a tighter dedicated limit.
paymentRouter.use(paymentRateLimiter);

paymentRouter.get("/my", requireAuth, getMyPayments);
paymentRouter.get("/invoices", requireAuth, getMyInvoices);
paymentRouter.get("/summary", requireAuth, getBillingSummary);
paymentRouter.get("/architect/:architectId", requireAuth, getPaymentsForArchitect);

// CLIENT (homeowner) creates a booking order
paymentRouter.post("/create-order", requireAuth, requireRole("CLIENT"), createBookingOrder);

// CLIENT (homeowner) creates a consultation payment
paymentRouter.post("/consultation", requireAuth, requireRole("CLIENT"), createConsultationPayment);

// ARCHITECT pays for a subscription
paymentRouter.post("/subscription", requireAuth, requireRole("ARCHITECT"), createSubscriptionPayment);

// ARCHITECT pays for a featured placement
paymentRouter.post("/featured", requireAuth, requireRole("ARCHITECT"), createFeaturedPlacementPayment);

paymentRouter.post("/webhook", webhookRateLimiter, handleRazorpayWebhook);
paymentRouter.post("/verify", requireAuth, verifyPayment);
paymentRouter.get("/invoices/:invoiceId/pdf", requireAuth, downloadInvoicePdf);

export default paymentRouter;

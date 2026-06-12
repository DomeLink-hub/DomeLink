import crypto from "crypto";
import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { SUBSCRIPTION_PLANS, createRazorpayOrder, resolveWebhookSecret, verifyWebhookSignature } from "../services/payments/razorpay.service.js";
import { resolvePlan } from "../constants/pricingPlans.js";
import { env } from "../config/env.js";
import { emailEvents } from "../services/email/email.service.js";
import { logger } from "../utils/logger.js";
import { auditPayment } from "../services/audit/audit.service.js";
import PDFDocument from "pdfkit";

const consultationOrderSchema = z.object({
  architectId: z.string().uuid().optional(),
  consultationId: z.string().uuid().optional(),
  planName: z.string().optional(),
  packageName: z.string().optional(),
  planTitle: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default("INR"),
});

const subscriptionOrderSchema = z.object({
  tier: z.enum(["free", "pro", "studio"]),
});

const featuredOrderSchema = z.object({
  architectId: z.string().uuid(),
  placementType: z.enum(["homepage", "explore", "featured_badge"]).default("homepage"),
});

const verificationSchema = z.object({
  orderId: z.string().optional(),
  paymentId: z.string().optional(),
  signature: z.string().optional(),
  razorpay_order_id: z.string().optional(),
  razorpay_payment_id: z.string().optional(),
  razorpay_signature: z.string().optional(),
  purpose: z.enum(["consultation", "subscription", "featured"]).optional(),
  tier: z.enum(["free", "pro", "studio"]).optional(),
  architectId: z.string().uuid().optional(),
  consultationId: z.string().uuid().optional(),
});

const createOrderSchema = z.object({
  amount: z.number().positive(),
  planName: z.string().min(1),
  architectId: z.string().uuid(),
  consultationId: z.string().uuid().optional(),
});

const getOrderId = (order: unknown) => {
  if (order && typeof order === "object" && "id" in order) {
    return String((order as { id: string }).id);
  }
  return undefined;
};

const buildInvoiceNumber = (paymentId: string) => `INV-${paymentId.slice(0, 8).toUpperCase()}`;

export const reconcilePaymentByOrderId = async (orderId: string, paymentId: string, signature?: string) => {
  const payment = await prisma.payment.findUnique({ where: { providerOrderId: orderId } });
  if (!payment) throw new AppError("Payment not found", 404);
    // idempotency: if payment already marked PAID, skip heavy work
    if (payment.status === "PAID") {
      return payment;
    }

  // handle rare unique-constraint race where another webhook processed the same providerPaymentId
  try {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "PAID",
        providerPaymentId: paymentId,
        ...(signature ? { providerSignature: signature } : {}),
      },
    });
  } catch (e: any) {
    if (e?.code === 'P2002') {
      const other = await prisma.payment.findUnique({ where: { providerPaymentId: paymentId } });
      if (other) return other as any;
    }
    throw e;
  }

  const metadata = (payment.metadata && typeof payment.metadata === "object" ? payment.metadata : {}) as Record<string, unknown>;
  const payer = await prisma.user.findUnique({ where: { id: payment.payerId } });

  const invoiceExists = await prisma.invoice.findUnique({ where: { paymentId: payment.id } });
  let invoice = await prisma.invoice.findUnique({ where: { paymentId: payment.id } });
  if (!invoice) {
    invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: buildInvoiceNumber(paymentId),
        userId: payment.payerId,
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: "issued",
        metadata: { purpose: payment.purpose, orderId, ...metadata },
      },
    });

    // attach a downloadable pdf URL (relative) so frontends can fetch the invoice
    try {
      const pdfUrl = `/api/payments/invoices/${invoice.id}/pdf`;
      await prisma.invoice.update({ where: { id: invoice.id }, data: { pdfUrl } });
      invoice.pdfUrl = pdfUrl as any;
    } catch (e) {
      // non-fatal if update fails
    }
  }

  if (payment.purpose === "subscription") {
    const tier = String(metadata.tier || "free").toUpperCase() as "FREE" | "PRO" | "STUDIO";
    await prisma.subscription.upsert({
      where: { userId: payment.payerId },
      update: {
        tier,
        status: "active",
        autoRenew: true,
        providerSubscriptionId: paymentId,
        metadata: { verifiedOrderId: orderId, ...metadata },
      },
      create: {
        userId: payment.payerId,
        tier,
        status: "active",
        autoRenew: true,
        providerSubscriptionId: paymentId,
        metadata: { verifiedOrderId: orderId, ...metadata },
      },
    });

    if (payer?.email) {
      await emailEvents.subscriptionUpgrade(payer.email, tier);
    }
  }

  if (payment.purpose === "featured") {
    const architectId = String(metadata.architectId || payment.payerId);
    const placementType = String(metadata.placementType || "homepage").toUpperCase() as "HOMEPAGE" | "EXPLORE" | "FEATURED_BADGE";
    await prisma.featuredPlacement.upsert({
      where: { paymentId: payment.id },
      update: {
        architectId,
        placementType,
        isActive: true,
        metadata: { verifiedPaymentId: paymentId, ...metadata },
      },
      create: {
        architectId,
        paymentId: payment.id,
        placementType,
        isActive: true,
        metadata: { verifiedPaymentId: paymentId, ...metadata },
      },
    });
  }

  if (payment.purpose === "consultation" && payment.consultationId) {
    await prisma.consultation.updateMany({
      where: { id: payment.consultationId },
      data: { status: "ACCEPTED" },
    });
  }

  return payment;
};

export const getPaymentsForArchitect = asyncHandler(async (req: Request, res: Response) => {
  const architectId = req.params.architectId;
  const payments = await prisma.payment.findMany({
    where: { OR: [{ payeeId: architectId }, { project: { architectId } }] },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json(payments);
});

export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const payments = await prisma.payment.findMany({
    where: { payerId: userId },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(payments);
});

export const getMyInvoices = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const invoices = await prisma.invoice.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  res.status(200).json(invoices);
});

export const createBookingOrder = asyncHandler(async (req: Request, res: Response) => {
  const payload = createOrderSchema.parse(req.body);
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const plan = resolvePlan(payload.planName);
  if (!plan) throw new AppError("Invalid plan name", 400);
  if (plan.priceInr !== Math.round(payload.amount)) {
    throw new AppError("Amount does not match selected plan", 400);
  }

  const amountPaise = plan.priceInr * 100;
  const order = await createRazorpayOrder(amountPaise, "INR", `booking_${userId}_${Date.now()}`);

  if (!order || typeof order !== "object" || "skipped" in order) {
    throw new AppError("Razorpay is not configured", 503);
  }

  const orderId = getOrderId(order);
  if (!orderId) throw new AppError("Failed to create Razorpay order", 500);

  if (payload.consultationId) {
    const consultation = await prisma.consultation.findFirst({
      where: { id: payload.consultationId, userId },
    });
    if (!consultation) throw new AppError("Consultation not found", 404);
    await prisma.consultation.update({
      where: { id: payload.consultationId },
      data: { amount: plan.priceInr, status: "PENDING" },
    });
  }

  const architect = await prisma.user.findFirst({
    where: { id: payload.architectId, role: "ARCHITECT" },
  });
  if (!architect) throw new AppError("Architect not found", 404);

  await prisma.payment.create({
    data: {
      payerId: userId,
      payeeId: payload.architectId,
      consultationId: payload.consultationId,
      amount: plan.priceInr,
      currency: "INR",
      status: "PENDING",
      method: "razorpay",
      purpose: "consultation",
      providerOrderId: orderId,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        orderId,
        consultationId: payload.consultationId,
      },
    },
  });

  if (!env.RAZORPAY_KEY_ID) {
    throw new AppError("Razorpay key not configured", 503);
  }

  res.status(201).json({
    orderId,
    amount: amountPaise,
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
  });
});

export const createConsultationPayment = asyncHandler(async (req: Request, res: Response) => {
  const payload = consultationOrderSchema.parse(req.body);
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const order = await createRazorpayOrder(Math.round(payload.amount * 100), payload.currency, `consultation_${Date.now()}`);
  if (!order || typeof order !== "object" || "skipped" in order) {
    const reason = order && typeof order === "object" && "reason" in order ? String((order as any).reason) : "RAZORPAY_KEY_ID/SECRET not configured";
    throw new AppError(`Razorpay is not configured: ${reason}`, 503);
  }

  const orderId = getOrderId(order);
  if (!orderId) {
    throw new AppError("Failed to create Razorpay order", 500);
  }

  const planLabel = payload.planName || payload.packageName || payload.planTitle;
  const payment = await prisma.payment.create({
    data: {
      payerId: userId,
      payeeId: payload.architectId,
      consultationId: payload.consultationId,
      amount: Math.round(payload.amount),
      currency: payload.currency,
      status: "PENDING",
      method: "razorpay",
      purpose: "consultation",
      providerOrderId: orderId,
      metadata: {
        orderId,
        kind: "consultation",
        amount: payload.amount,
        currency: payload.currency,
        ...(planLabel ? { planName: planLabel } : {}),
      },
    },
  });

  if (!env.RAZORPAY_KEY_ID) {
    throw new AppError("Razorpay key not configured", 503);
  }

  res.status(201).json({
    payment,
    order,
    orderId,
    amount: payload.amount,
    currency: payload.currency,
    key: env.RAZORPAY_KEY_ID,
  });
});

export const createSubscriptionPayment = asyncHandler(async (req: Request, res: Response) => {
  const payload = subscriptionOrderSchema.parse(req.body);
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const plan = SUBSCRIPTION_PLANS[payload.tier];
  const order = await createRazorpayOrder(plan.price * 100, "INR", `subscription_${userId}_${payload.tier}`);

  const payment = await prisma.payment.create({
    data: {
      payerId: userId,
      amount: plan.price,
      currency: "INR",
      status: "PENDING",
      method: "razorpay",
      purpose: "subscription",
      providerOrderId: getOrderId(order),
      metadata: { orderId: getOrderId(order), tier: payload.tier, planId: plan.id, amount: plan.price },
    },
  });

  await prisma.subscription.upsert({
    where: { userId },
    update: { tier: payload.tier.toUpperCase() as "PRO" | "STUDIO" | "FREE", status: "pending" },
    create: { userId, tier: payload.tier.toUpperCase() as "PRO" | "STUDIO" | "FREE", status: "pending" },
  });

  res.status(201).json({ payment, order, plan });
});

export const createFeaturedPlacementPayment = asyncHandler(async (req: Request, res: Response) => {
  const payload = featuredOrderSchema.parse(req.body);
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const amount = payload.placementType === "featured_badge" ? 2999 : payload.placementType === "explore" ? 4999 : 7999;
  const order = await createRazorpayOrder(amount * 100, "INR", `featured_${userId}_${payload.placementType}`);

  const payment = await prisma.payment.create({
    data: {
      payerId: userId,
      amount,
      currency: "INR",
      status: "PENDING",
      method: "razorpay",
      purpose: "featured",
      providerOrderId: getOrderId(order),
      metadata: { orderId: getOrderId(order), placementType: payload.placementType, architectId: payload.architectId, amount },
    },
  });

  res.status(201).json({ payment, order });
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const payload = verificationSchema.parse(req.body);
  const orderId = payload.orderId || payload.razorpay_order_id;
  const paymentId = payload.paymentId || payload.razorpay_payment_id;
  const signature = payload.signature || payload.razorpay_signature;
  const purpose = payload.purpose || "consultation";

  if (!orderId || !paymentId || !signature) {
    throw new AppError("Missing payment verification fields", 400);
  }

  const secret = env.RAZORPAY_KEY_SECRET || resolveWebhookSecret();
  const isValid = verifyWebhookSignature(`${orderId}|${paymentId}`, signature, secret);
  if (!isValid) {
    throw new AppError("Invalid payment signature", 400);
  }
  const payment = await reconcilePaymentByOrderId(orderId, paymentId, signature);
  auditPayment(req.user?.id || "unknown", "completed", paymentId, { orderId, purpose });
  return res.status(200).json({ ok: true, payment, status: "COMPLETED" });
});

export const handleRazorpayWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signature = String(req.header("x-razorpay-signature") || "");
  const rawBody = req.rawBody?.toString("utf8") || JSON.stringify(req.body || {});

  if (!verifyWebhookSignature(rawBody, signature, resolveWebhookSecret())) {
    throw new AppError("Invalid webhook signature", 400);
  }

  const webhook = z.object({
    event: z.string(),
    payload: z.record(z.unknown()).optional(),
  }).parse(req.body);

  // persist webhook event for auditing and replay
  const payloadAny = webhook.payload as any;
  const hash = crypto.createHash("sha256").update(rawBody).digest("hex");
  // attempt to create; if exists, load existing event
  let webhookRecord;
  try {
    webhookRecord = await prisma.webhookEvent.create({ data: { provider: "razorpay", event: webhook.event, payload: payloadAny || {}, payloadHash: hash, signature } });
  } catch (e: any) {
    // unique constraint violation -> load existing
    webhookRecord = await prisma.webhookEvent.findUnique({ where: { payloadHash: hash } });
  }

  // if already processed, return success to provider
  if (webhookRecord?.processed) {
    return res.status(200).json({ ok: true, event: webhook.event, replay: true });
  }
  const paymentEntity = (payloadAny?.payment?.entity || payloadAny?.order?.entity || payloadAny?.entity || {}) as Record<string, unknown>;
  const orderId = String(paymentEntity.order_id || paymentEntity.orderId || paymentEntity.id || "");
  const paymentId = String(paymentEntity.id || paymentEntity.payment_id || paymentEntity.paymentId || "");

  if (orderId && paymentId) {
    await reconcilePaymentByOrderId(orderId, paymentId, signature);
    // mark webhook processed
    try {
      await prisma.webhookEvent.update({ where: { payloadHash: hash }, data: { processed: true, processedAt: new Date() } });
    } catch (e) {
      // ignore
    }
  }

  res.status(200).json({ ok: true, event: webhook.event });
});

export const getBillingSummary = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);

  const [subscription, payments, featuredPlacements] = await Promise.all([
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.payment.findMany({ where: { payerId: userId }, orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.featuredPlacement.findMany({ where: { architectId: userId }, orderBy: { createdAt: "desc" } }),
  ]);

  res.status(200).json({ subscription, payments, featuredPlacements });
});

export const downloadInvoicePdf = asyncHandler(async (req: Request, res: Response) => {
  const invoiceId = req.params.invoiceId;
  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) throw new AppError("Invoice not found", 404);

  const payer = await prisma.user.findUnique({ where: { id: invoice.userId } });

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${invoice.invoiceNumber}.pdf`);

  // stream PDF directly to response
  doc.pipe(res);

  doc.fontSize(20).text("DomeLink", { align: "left" });
  doc.moveDown();
  doc.fontSize(14).text(`Invoice: ${invoice.invoiceNumber}`);
  doc.text(`Issued: ${invoice.issuedAt.toISOString().split("T")[0]}`);
  doc.moveDown();

  doc.fontSize(12).text(`Billed To: ${payer?.name || "Customer"}`);
  doc.text(`Email: ${payer?.email || ""}`);
  doc.moveDown();

  doc.text(`Amount: ₹${(invoice.amount / 1).toLocaleString()}`);
  doc.text(`Currency: ${invoice.currency}`);
  doc.moveDown();

  if (invoice.metadata) {
    doc.text(`Notes:`);
    doc.fontSize(10).text(JSON.stringify(invoice.metadata, null, 2));
  }

  doc.end();
});

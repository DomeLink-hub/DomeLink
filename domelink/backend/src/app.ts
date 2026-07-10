import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import prisma from "./config/prisma.js";
import { apiRateLimiter } from "./middleware/rateLimit.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { suspiciousRequestDetector } from "./middleware/suspiciousRequest.js";
import { logger } from "./utils/logger.js";
import mongoose from "mongoose";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: env.SENTRY_DSN,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
  profilesSampleRate: env.NODE_ENV === "production" ? 0.2 : 1.0,
});

const app = express();

/* ── CORS ────────────────────────────────────────────────────── */
const allowedOrigins = [
  env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true); // curl, Postman, mobile
    if (allowedOrigins.includes(origin)) return callback(null, true);
    logger.warn("CORS blocked", { origin });
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

/* ── Suspicious Request Detection ────────────────────────────── */
app.use(suspiciousRequestDetector);

/* ── Security headers (Helmet + CSP) ────────────────────────── */
const helmetFn = typeof helmet === "function" ? helmet : (helmet as any).default;
app.use(helmetFn({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'"],   // needed for inline scripts in some SSR setups
      styleSrc:       ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc:        ["'self'", "https://fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
      connectSrc:     ["'self'", env.FRONTEND_URL || "http://localhost:8080"],
      frameSrc:       ["'none'"],
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: env.NODE_ENV === "production" ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // needed for Cloudinary images
}));

/* ── Cookie parser ───────────────────────────────────────────── */
app.use(cookieParser());

/* ── Raw body capture (webhook signature verification) ──────── */
// Capture the raw request body only for webhook endpoints (signature verification).
// Do not consume the stream for general JSON endpoints, otherwise body-parser fails.
app.use((req, res, next) => {
  const webhookPaths = ["/api/payments/webhook", "/api/payments/razorpay-webhook"];
  if (webhookPaths.some((p) => req.path.startsWith(p))) {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => {
      try { req.rawBody = Buffer.concat(chunks); } catch { req.rawBody = undefined; }
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: "2mb" }));

/* ── MongoDB (legacy models) ─────────────────────────────────── */
if (env.MONGO_URI) {
  mongoose
    .connect(env.MONGO_URI, { dbName: "domelink" })
    .then(() => logger.info("MongoDB connected"))
    .catch((err) => {
      // Non-fatal: Postgres-backed features continue working even if Mongo is down
      logger.warn("MongoDB connection failed — Mongo-backed features (blog, support, project-brief, team, styleQuiz, analytics events) will be unavailable", { error: err.message });
    });

  // Log post-connect errors without crashing the process
  mongoose.connection.on("error", (err) => {
    logger.warn("MongoDB runtime error", { error: err.message });
  });
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
} else {
  logger.warn("MONGO_URI not configured — Mongo-backed features inactive");
}

/* ── Health endpoints ────────────────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", ts: new Date().toISOString(), env: env.NODE_ENV });
});

app.get("/api/health/readiness", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ready: true,
      db: true,
      cloudinary: Boolean(env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET && env.CLOUDINARY_CLOUD_NAME),
      ts: new Date().toISOString(),
    });
  } catch (e) {
    logger.error("Readiness check failed", { error: String(e) });
    res.status(503).json({ ready: false, error: String(e) });
  }
});

app.get("/api/health/liveness", (_req, res) => {
  res.json({ alive: true, ts: new Date().toISOString(), uptime: process.uptime() });
});


/* ── Rate limiting ───────────────────────────────────────────── */
app.use(apiRateLimiter);

import { startWebhookRetryWorker } from "./services/payments/webhookRetry.service.js";

/* ── Routes ──────────────────────────────────────────────────── */
app.use("/api", routes);

/* ── Sentry Error Handler ────────────────────────────────────── */
app.use(Sentry.expressErrorHandler() as any);

/* ── Global error handler ────────────────────────────────────── */
app.use(errorHandler);

// Start background workers
if (env.NODE_ENV !== "test") {
  startWebhookRetryWorker();
}

export default app;

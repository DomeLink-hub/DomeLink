import { createRequire } from "module";
const require = createRequire(import.meta.url);
const rateLimit = require("express-rate-limit");

// General API — 200 req / 15 min
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  skip: (req: any) => req.path === "/api/health" || req.path === "/api/health/readiness",
});

// Auth endpoints — 5 req / 15 min in production (brute-force prevention)
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many authentication attempts. Please wait before trying again." },
  skip: () => process.env.NODE_ENV !== "production",
});

// AI endpoints — 10 req / 10 min (abuse throttling)
export const aiRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "AI request limit reached. Please wait before generating more estimates." },
});

// Webhook endpoints — burst-tolerant
export const webhookRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many webhook requests." },
});

// Upload endpoints — 20 req / 5 min
export const uploadRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Upload limit reached. Please wait before uploading more files." },
});

// Payment endpoints — 30 req / 15 min (prevents hammering order creation / verify)
export const paymentRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please wait before trying again." },
});

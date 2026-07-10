import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const baseEnvPath = path.resolve(currentDir, "../../.env");
const localEnvPath = path.resolve(currentDir, "../../.env.local");

dotenv.config({ path: baseEnvPath });
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true });
}

export const env = {
  PORT:                   process.env.PORT || 5000,
  JWT_SECRET:             process.env.JWT_SECRET || "fallback_secret_change_in_production",
  DATABASE_URL:           process.env.DATABASE_URL,
  MONGO_URI:              process.env.MONGO_URI || process.env.MONGODB_URI || "",
  FRONTEND_URL:           process.env.FRONTEND_URL || "http://localhost:8080",
  NODE_ENV:               process.env.NODE_ENV || "development",
  JWT_EXPIRES_IN:         process.env.JWT_EXPIRES_IN || "7d",
  CLOUDINARY_CLOUD_NAME:  process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY:     process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET:  process.env.CLOUDINARY_API_SECRET,
  RAZORPAY_KEY_ID:        process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET:    process.env.RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET:process.env.RAZORPAY_WEBHOOK_SECRET,
  RESEND_API_KEY:         process.env.RESEND_API_KEY,
  EMAIL_FROM:             process.env.EMAIL_FROM || "DomeLink <noreply@domelink.ai>",
  SENTRY_DSN:             process.env.SENTRY_DSN,
  GROQ_API_KEY:           process.env.GROQ_API_KEY,
};

/** Validate critical env vars at startup. Warns in dev, throws in prod. */
export const validateEnv = () => {
  const required = ["JWT_SECRET", "DATABASE_URL"] as const;
  const recommended = ["GROQ_API_KEY", "CLOUDINARY_API_KEY", "RAZORPAY_KEY_ID", "RESEND_API_KEY"] as const;
  const missing: string[] = [];
  const missingRecommended: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }
  for (const key of recommended) {
    if (!process.env[key]) missingRecommended.push(key);
  }

  // In production, RAZORPAY_WEBHOOK_SECRET must be explicitly set.
  // Falling back to RAZORPAY_KEY_SECRET at runtime is a security risk in prod
  // (the webhook secret and API key secret should be different values).
  if (env.NODE_ENV === "production" && !process.env.RAZORPAY_WEBHOOK_SECRET) {
    missing.push("RAZORPAY_WEBHOOK_SECRET");
  }

  if (missing.length > 0) {
    const msg = `Missing required environment variables: ${missing.join(", ")}`;
    if (env.NODE_ENV === "production") throw new Error(msg);
    console.warn(`[ENV] WARNING: ${msg}`);
  }

  if (missingRecommended.length > 0) {
    console.warn(`[ENV] Optional services not configured: ${missingRecommended.join(", ")}`);
  }

  if (env.JWT_SECRET === "fallback_secret_change_in_production" && env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set to a secure value in production.");
  }
};

export const hasProductionSecrets = () =>
  Boolean(
    env.JWT_SECRET !== "fallback_secret_change_in_production" &&
    env.DATABASE_URL &&
    env.CLOUDINARY_CLOUD_NAME &&
    env.CLOUDINARY_API_KEY &&
    env.CLOUDINARY_API_SECRET &&
    env.RAZORPAY_KEY_ID &&
    env.RAZORPAY_KEY_SECRET &&
    env.RESEND_API_KEY,
  );

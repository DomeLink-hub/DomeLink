/**
 * DomeLink Audit Trail Service
 * Enterprise-grade event logging for admin actions, payments, AI, and state changes.
 */
import { logger } from "../../utils/logger.js";

export type AuditCategory =
  | "auth"
  | "admin"
  | "payment"
  | "subscription"
  | "ai"
  | "verification"
  | "consultation"
  | "project"
  | "upload"
  | "webhook";

export interface AuditEvent {
  actor: string;          // userId or "system"
  action: string;         // e.g. "architect.verified", "payment.completed"
  category: AuditCategory;
  resourceId?: string;    // affected entity ID
  resourceType?: string;  // e.g. "architect", "payment"
  meta?: Record<string, unknown>;
  ip?: string;
}

/**
 * Record an audit event. Writes structured JSON to stdout.
 * In production, pipe stdout to a log aggregator (Datadog, CloudWatch, etc.)
 */
export const audit = (event: AuditEvent): void => {
  logger.audit(event.actor, event.action, {
    category:     event.category,
    resourceId:   event.resourceId,
    resourceType: event.resourceType,
    ip:           event.ip,
    ...event.meta,
  });
};

// ── Convenience helpers ───────────────────────────────────────

export const auditAuth = (actor: string, action: "login" | "logout" | "register" | "token_refresh" | "failed_login", meta?: Record<string, unknown>) =>
  audit({ actor, action: `auth.${action}`, category: "auth", meta });

export const auditAdmin = (actor: string, action: string, resourceId?: string, meta?: Record<string, unknown>) =>
  audit({ actor, action: `admin.${action}`, category: "admin", resourceId, meta });

export const auditPayment = (actor: string, action: "created" | "completed" | "failed" | "refunded", paymentId: string, meta?: Record<string, unknown>) =>
  audit({ actor, action: `payment.${action}`, category: "payment", resourceId: paymentId, resourceType: "payment", meta });

export const auditAI = (actor: string, action: "estimate_generated" | "copilot_run" | "brief_generated" | "chat_message", meta?: Record<string, unknown>) =>
  audit({ actor, action: `ai.${action}`, category: "ai", meta });

export const auditVerification = (actor: string, architectId: string, status: "approved" | "rejected", meta?: Record<string, unknown>) =>
  audit({ actor, action: `verification.${status}`, category: "verification", resourceId: architectId, resourceType: "architect", meta });

export const auditConsultation = (actor: string, consultationId: string, action: "created" | "accepted" | "rejected" | "completed", meta?: Record<string, unknown>) =>
  audit({ actor, action: `consultation.${action}`, category: "consultation", resourceId: consultationId, resourceType: "consultation", meta });

export const auditUpload = (actor: string, assetId: string, action: "uploaded" | "approved" | "rejected", meta?: Record<string, unknown>) =>
  audit({ actor, action: `upload.${action}`, category: "upload", resourceId: assetId, resourceType: "upload_asset", meta });

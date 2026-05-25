/**
 * DomeLink Structured Logger
 * JSON-structured, environment-aware, context-rich logging.
 */

type LogLevel = "debug" | "info" | "warn" | "error";
type LogMeta = Record<string, unknown>;

const isProd = process.env.NODE_ENV === "production";
const ts = () => new Date().toISOString();

const emit = (level: LogLevel, message: string, meta: LogMeta = {}) => {
  const entry = JSON.stringify({
    level,
    ts: ts(),
    env: process.env.NODE_ENV || "development",
    service: "domelink-api",
    message,
    ...meta,
  });

  if (level === "error") {
    process.stderr.write(entry + "\n");
  } else {
    process.stdout.write(entry + "\n");
  }
};

export const logger = {
  debug(message: string, meta: LogMeta = {}) {
    if (!isProd) emit("debug", message, meta);
  },
  info(message: string, meta: LogMeta = {}) {
    emit("info", message, meta);
  },
  warn(message: string, meta: LogMeta = {}) {
    emit("warn", message, meta);
  },
  error(message: string, meta: LogMeta = {}) {
    emit("error", message, meta);
  },

  // Domain-specific helpers
  ai(event: string, meta: LogMeta = {}) {
    emit("info", `[AI] ${event}`, { domain: "ai", ...meta });
  },
  aiError(event: string, meta: LogMeta = {}) {
    emit("error", `[AI] ${event}`, { domain: "ai", ...meta });
  },
  payment(event: string, meta: LogMeta = {}) {
    emit("info", `[PAYMENT] ${event}`, { domain: "payment", ...meta });
  },
  paymentError(event: string, meta: LogMeta = {}) {
    emit("error", `[PAYMENT] ${event}`, { domain: "payment", ...meta });
  },
  webhook(event: string, meta: LogMeta = {}) {
    emit("info", `[WEBHOOK] ${event}`, { domain: "webhook", ...meta });
  },
  webhookError(event: string, meta: LogMeta = {}) {
    emit("error", `[WEBHOOK] ${event}`, { domain: "webhook", ...meta });
  },
  auth(event: string, meta: LogMeta = {}) {
    emit("info", `[AUTH] ${event}`, { domain: "auth", ...meta });
  },
  audit(actor: string, action: string, meta: LogMeta = {}) {
    emit("info", `[AUDIT] ${action}`, { domain: "audit", actor, action, ...meta });
  },
};

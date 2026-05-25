import prisma from "../config/prisma.js";
import { logger } from "../utils/logger.js";

interface AuditLogData {
  actorId?: string;
  action: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export const auditService = {
  async log(data: AuditLogData) {
    try {
      // Always log to the application logger
      logger.audit(data.actorId || "system", data.action, data.metadata);

      // Attempt to write to database, but don't fail the operation if it fails
      if (!prisma.auditLog) {
        logger.warn("Prisma auditLog model not available - Prisma client may need regeneration", { data });
        return;
      }

      await prisma.auditLog.create({
        data: {
          actorId: data.actorId || null,
          action: data.action,
          entityId: data.entityId || null,
          metadata: data.metadata || {},
          ipAddress: data.ipAddress || null,
        },
      });
    } catch (e: any) {
      // Non-fatal error: log but don't throw
      logger.error("Failed to write audit log to database", { 
        error: e.message, 
        data,
        errorCode: e.code 
      });
      // Don't rethrow - audit logging failures should never break the application
    }
  },
};

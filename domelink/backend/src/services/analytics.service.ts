import prisma from "../config/prisma.js";
import { logger } from "../utils/logger.js";

interface AnalyticsData {
  userId?: string;
  eventName: string;
  metadata?: Record<string, any>;
}

export const analyticsService = {
  async track(data: AnalyticsData) {
    try {
      // Always log to the application logger
      logger.info(`[ANALYTICS] ${data.eventName}`, { userId: data.userId, metadata: data.metadata });

      // Attempt to write to database, but don't fail the operation if it fails
      if (!prisma.analyticsEvent) {
        logger.warn("Prisma analyticsEvent model not available - Prisma client may need regeneration", { data });
        return;
      }

      await prisma.analyticsEvent.create({
        data: {
          userId: data.userId || null,
          eventName: data.eventName,
          metadata: data.metadata || {},
        },
      });
    } catch (e: any) {
      // Non-fatal error: log but don't throw
      logger.error("Failed to write analytics event to database", { 
        error: e.message, 
        data,
        errorCode: e.code 
      });
      // Don't rethrow - analytics failures should never break the application
    }
  },
};

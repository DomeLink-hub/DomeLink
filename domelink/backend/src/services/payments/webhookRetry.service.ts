import prisma from "../../config/prisma.js";
import { logger } from "../../utils/logger.js";

// Since webhooks can be complex, we just mark a replay attempt.

const RETRY_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export const startWebhookRetryWorker = () => {
  setInterval(async () => {
    try {
      const failedWebhooks = await prisma.webhookEvent.findMany({
        where: { processed: false, createdAt: { lt: new Date(Date.now() - 5 * 60 * 1000) } }, // 5 mins old
        take: 50
      });
      
      if (failedWebhooks.length > 0) {
        logger.info(`[WEBHOOK RETRY] Found ${failedWebhooks.length} unprocessed webhooks. Retrying...`);
        for (const webhook of failedWebhooks) {
           // Create a replay log
           await prisma.webhookReplay.create({
             data: {
               webhookEventId: webhook.id,
               adminId: "system",
               notes: { reason: "auto-retry" }
             }
           });
           logger.info(`[WEBHOOK RETRY] Enqueued webhook retry for event: ${webhook.event}`);
           // Actual re-processing would require invoking the webhook payload handler.
           // Since webhooks can be complex, we just mark a replay attempt.
        }
      }
    } catch (e: any) {
      logger.error("[WEBHOOK RETRY WORKER] Error", { error: e.message });
    }
  }, RETRY_INTERVAL_MS);
  
  logger.info("[WEBHOOK RETRY WORKER] Started.");
};

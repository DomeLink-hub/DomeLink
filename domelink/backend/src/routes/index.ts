/**
 * DomeLink API - Main Router Configuration
 * Author: Khengar Chaun
 */

import { Router, Request, Response, NextFunction } from 'express';

// Import individual route modules
import authRoutes from './auth.routes.js';
import architectOnboardingRoutes from './architect.onboarding.routes.js';
import architectRoutes from './architect.routes.js';
import { recommendationRouter } from './recommendation.routes.js';
import consultationRoutes from './consultation.routes.js';
import chatRoutes from './chat.routes.js';
import { userRouter } from './user.routes.js';
import { savedRouter } from './saved.routes.js';
import portfolioRoutes from './portfolio.routes.js';
import { reviewRouter } from './review.routes.js';
import onboardingRoutes from './onboarding.routes.js';
import projectRoutes from './project.routes.js';
import aiRoutes from './ai.routes.js';
import adminRoutes from './admin.routes.js';
import paymentRoutes from './payment.routes.js';
import storageRoutes from './storage.routes.js';
import { projectBriefRouter as projectBriefRoutes } from './project-brief.routes.js';
import { supportRouter as supportRoutes } from './support.routes.js';
import { teamRouter as teamRoutes } from './team.routes.js';
import notificationRoutes from './notification.routes.js';
import { blogRouter as blogRoutes } from './blog.routes.js';
import seoRoutes from './seo.routes.js';
import leadsRoutes from './leads.routes.js';
// Add any other routes you need (e.g., import adminRoutes from './admin.routes.js')

const router = Router();

// ==========================================
// API Health Check
// ==========================================
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'DomeLink API is online and routing correctly.',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// Mount Feature Routes
// ==========================================
router.use('/auth', authRoutes);
router.use('/architect', architectOnboardingRoutes);
router.use('/architects', architectRoutes);
router.use('/recommendations', recommendationRouter);
router.use('/consultations', consultationRoutes);
router.use('/chat', chatRoutes);
router.use('/users', userRouter);
router.use('/saved', savedRouter);
router.use('/portfolio', portfolioRoutes);
router.use('/reviews', reviewRouter);
router.use('/onboarding', onboardingRoutes)
router.use('/projects', projectRoutes);
router.use('/project-briefs', projectBriefRoutes);
router.use('/support', supportRoutes);
router.use('/team', teamRoutes);
router.use('/notifications', notificationRoutes);
router.use('/leads', leadsRoutes);
router.use('/blog', blogRoutes);
router.use('/ai', aiRoutes);
router.use('/admin', adminRoutes);
router.use('/payments', paymentRoutes);
router.use('/storage', storageRoutes);
router.use('/', seoRoutes);


// Mount analytics routes (track event, summary, admin views)
// POST /analytics — accept track event payloads (noop: events are written directly
// by analyticsService.track() in auth and other controllers, not via this endpoint)
router.post('/analytics', (req: Request, res: Response) => {
  res.status(200).json({ ok: true });
});

// GET /analytics/summary — real aggregation over the Prisma AnalyticsEvent table.
// analyticsService.track() writes rows there on every login, register, etc.
// Shape matches what the frontend AnalyticsSummary interface expects:
// { totals, byEvent: [{_id, count}], daily30: [{_id, count}], daily7: [{_id, count}] }
router.get('/analytics/summary', async (req: Request, res: Response) => {
  try {
    const prismaModule = await import('../config/prisma.js');
    const prisma = prismaModule.default;

    const now = new Date();
    const ago30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ago7  = new Date(now.getTime() -  7 * 24 * 60 * 60 * 1000);

    const [totalsResult, byEventResult, daily30Result, daily7Result] = await Promise.all([
      // total event count
      prisma.analyticsEvent.count(),

      // grouped by eventName
      prisma.analyticsEvent.groupBy({
        by: ['eventName'],
        _count: { _all: true },
        orderBy: { _count: { eventName: 'desc' } },
      }),

      // daily counts for last 30 days
      prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${ago30}
        GROUP BY day
        ORDER BY day ASC
      `,

      // daily counts for last 7 days
      prisma.$queryRaw<Array<{ day: string; count: bigint }>>`
        SELECT TO_CHAR("createdAt", 'YYYY-MM-DD') AS day, COUNT(*)::int AS count
        FROM "AnalyticsEvent"
        WHERE "createdAt" >= ${ago7}
        GROUP BY day
        ORDER BY day ASC
      `,
    ]);

    // Normalise to the _id/count shape the frontend already expects
    const byEvent = byEventResult.map((row) => ({
      _id: row.eventName,
      count: row._count._all,
    }));

    const daily30 = daily30Result.map((row) => ({
      _id: row.day,
      count: Number(row.count),
    }));

    const daily7 = daily7Result.map((row) => ({
      _id: row.day,
      count: Number(row.count),
    }));

    res.status(200).json({ totals: totalsResult, byEvent, daily30, daily7 });
  } catch (e: any) {
    // Non-fatal: fall back to empty shape so dashboards don't crash
    console.error('[analytics/summary] aggregation failed:', e.message);
    res.status(200).json({ totals: 0, byEvent: [], daily30: [], daily7: [] });
  }
});

// ==========================================
// 404 API Route Handler
// ==========================================
router.use('*', (req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

export default router;
/**
 * DomeLink API - Main Router Configuration
 * Author: Khengar Chaun
 */

import { Router, Request, Response, NextFunction } from 'express';

// Import individual route modules
import authRoutes from './auth.routes.js';
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
// Lightweight analytics endpoints (safe defaults) to satisfy frontend requests
router.post('/analytics', (req: Request, res: Response) => {
  // Accept track event payloads; noop in lightweight mode
  res.status(200).json({ ok: true });
});

router.get('/analytics/summary', (req: Request, res: Response) => {
  // Return an empty summary to keep dashboards working until analytics service is available
  res.status(200).json({ totals: 0, byEvent: [], daily30: [], daily7: [] });
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
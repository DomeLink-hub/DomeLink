/**
 * DomeLink API - Main Router Configuration
 * Author: Khengar Chaun
 */

import { Router, Request, Response, NextFunction } from 'express';

// Import individual route modules
import authRoutes from './auth.routes.js'; // Ensure the extension matches your TS config
import architectRoutes from './architect.routes.js';
import consultationRoutes from './consultation.routes.js';
import chatRoutes from './chat.routes.js';
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
router.use('/consultations', consultationRoutes);
router.use('/chat', chatRoutes);

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
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export function requireRole(role: 'homeowner' | 'architect') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    next();
  };
}

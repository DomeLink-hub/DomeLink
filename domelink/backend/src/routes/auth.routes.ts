import { Router } from 'express';
import { login, register, me, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.ts'; 

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', requireAuth, logout);
router.get('/me', requireAuth, me);

export default router;
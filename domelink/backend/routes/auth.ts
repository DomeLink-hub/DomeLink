import express from 'express';
import { homeownerSignup, homeownerLogin, architectSignup, architectLogin } from '../controllers/authController';

const router = express.Router();

// Homeowner Auth
router.post('/homeowner/signup', homeownerSignup);
router.post('/homeowner/login', homeownerLogin);

// Architect Auth
router.post('/architect/signup', architectSignup);
router.post('/architect/login', architectLogin);

export default router;

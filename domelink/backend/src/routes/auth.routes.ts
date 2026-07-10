import { Router } from "express";
import { login, register, getMe, logout, refresh, verifyEmail, resendVerification, forgotPassword, resetPassword } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register",            authRateLimiter, register);
router.post("/login",               authRateLimiter, login);
router.post("/logout",              logout);
router.get("/me",                   authenticate, getMe);
router.post("/refresh",             authRateLimiter, refresh);

// Email verification (no auth required — user clicks link from email)
router.post("/verify-email",        authRateLimiter, verifyEmail);
// Resend verification (auth required — user must be logged in to request resend)
router.post("/resend-verification", authRateLimiter, authenticate, resendVerification);

// Password reset (no auth required)
router.post("/forgot-password",     authRateLimiter, forgotPassword);
router.post("/reset-password",      authRateLimiter, resetPassword);

export default router;
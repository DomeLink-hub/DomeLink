import { Router } from "express";
import { login, register, getMe, logout, refresh } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";
import { authRateLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login",    authRateLimiter, login);
router.post("/logout",   logout);
router.get("/me",        authenticate, getMe);
router.post("/refresh",  authRateLimiter, refresh);

export default router;
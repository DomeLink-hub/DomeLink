import { Router } from "express";
import { login, register, getMe, logout } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authenticate, logout);
router.get("/me", authenticate, getMe); // Note: using getMe instead of me

export default router;
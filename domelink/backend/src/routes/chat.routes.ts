import { Router } from "express";
import { getChatHistory } from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/:consultationId", authenticate, getChatHistory);

export default router;
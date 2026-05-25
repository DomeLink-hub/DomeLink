import { Router } from "express";
import { getChatConversations, getChatGrouped, getChatHistory, markChatRead, sendChatMessage } from "../controllers/chat.controller.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.get("/conversations", authenticate, getChatConversations);
router.get("/:consultationId", authenticate, getChatHistory);
router.get("/:consultationId/grouped", authenticate, getChatGrouped);
router.post("/:consultationId/messages", authenticate, sendChatMessage);
router.post("/:consultationId", authenticate, sendChatMessage);
router.patch("/:consultationId/read", authenticate, markChatRead);

export default router;
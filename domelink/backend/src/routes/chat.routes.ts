import { Router } from "express";
import {
	getChatMessages,
	getGroupedChatMessages,
	markChatAsRead,
	postChatMessage,
} from "../controllers/chat.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const chatRouter = Router();

chatRouter.get("/:consultationId", requireAuth, getChatMessages);
chatRouter.get("/:consultationId/grouped", requireAuth, getGroupedChatMessages);
chatRouter.post("/:consultationId", requireAuth, postChatMessage);
chatRouter.patch("/:consultationId/read", requireAuth, markChatAsRead);

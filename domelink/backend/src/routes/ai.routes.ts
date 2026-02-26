
import { Router } from "express";
import { handleAIRequest } from "../controllers/ai.controller.js";

export const aiRouter = Router();
aiRouter.post("/chat", handleAIRequest);

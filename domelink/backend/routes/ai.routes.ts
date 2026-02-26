import { Router, Response } from "express";
import { authenticate, AuthRequest } from "../middleware/auth";
import rateLimit from "express-rate-limit";
import { getChatCompletion, getCostEstimate, recommendArchitects } from "../services/ai.service";

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: "Too many AI requests, please slow down."
});

const router = Router();

// Smart Architect Recommendation
router.get("/recommend-architects", authenticate, aiLimiter, async (req: AuthRequest, res: Response) => {
  try {
    console.log("[AI] /recommend-architects called by user:", req.user?._id || req.user);
    // Fetch user profile and all architects from DB (replace with real queries)
    const userProfile = req.user;
    const architects: any[] = [];
    // ...fetch architects from DB
    const recommendations = await recommendArchitects(userProfile, architects);
    res.json({ recommendations });
  } catch (err) {
    console.error("[AI] /recommend-architects error:", err);
    res.status(500).json({ message: "Failed to recommend architects" });
  }
});

// AI Cost Estimator
router.post("/cost-estimate", authenticate, aiLimiter, async (req, res) => {
  try {
    console.log("[AI] /cost-estimate input:", req.body);
    const input = req.body;
    // Validate input
    if (!input.projectType || !input.builtUpArea || !input.location || !input.qualityTier) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const estimate = await getCostEstimate(input);
    res.json(estimate);
  } catch (err) {
    console.error("[AI] /cost-estimate error:", err);
    res.status(500).json({ message: "Failed to estimate cost" });
  }
});

// Floating AI Chatbot
router.post("/chat", authenticate, aiLimiter, async (req, res) => {
  try {
    console.log("[AI] /chat input:", req.body);
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ message: "Invalid chat input" });
    }
    const systemPrompt = "You are DomeLink's helpful AI assistant. Answer questions about the platform, guide users, and help them connect with architects.";
    const reply = await getChatCompletion(messages, systemPrompt);
    res.json({ reply });
  } catch (err) {
    console.error("[AI] /chat error:", err);
    res.status(500).json({ message: "AI chat failed" });
  }
});

export default router;

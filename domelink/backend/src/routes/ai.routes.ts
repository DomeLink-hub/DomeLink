import { Router } from "express";
import { generateBudgetReality } from "../services/ai/budgetEngine.service.js";
import { chatWithArchitectAI } from "../services/ai/assistant.service.js";
import { summarizeConsultationRequest, summarizeProjectWorkspace } from "../services/ai/summary.service.js";
import { generateAvoraEstimate } from "../services/ai/avoraEstimate.service.js";
import { generateProjectHealth, generateConsultationBrief, generateSmartNotificationText } from "../services/ai/projectCopilot.service.js";
import { authenticate } from "../middleware/auth.js";
import { aiRateLimiter } from "../middleware/rateLimit.js";
import { logger } from "../utils/logger.js";
import prisma from "../config/prisma.js";

const router = Router();

// Apply AI-specific rate limiter to all AI routes
router.use(aiRateLimiter);

router.post("/budget", (req, res) => {
    try {
        const { city, plotSizeSqFt, floors, projectType, qualityTier, interiorsIncluded, vastuRequirements, lifestyleFeatures, locationType, materialPreference } = req.body;
        const budget = generateBudgetReality({
            city: city || req.body.city,
            plotSizeSqFt: Number(plotSizeSqFt || req.body.plotArea || 0),
            floors: Number(floors || 1),
            projectType: projectType || "Residential",
            qualityTier: qualityTier || "Premium",
            interiorsIncluded: interiorsIncluded ?? true,
            vastuRequirements: vastuRequirements ?? false,
            lifestyleFeatures: lifestyleFeatures ?? [],
            locationType: locationType,
            materialPreference: materialPreference,
        });
        res.json(budget);
    } catch (error: any) {
        res.status(400).json({ error: error.message });
    }
});

router.post("/chat", authenticate, async (req, res) => {
    try {
        const { messages, stream = true } = req.body;
        if (!messages || !Array.isArray(messages)) return res.status(400).json({ error: "Invalid messages array." });

        const chatStream = await chatWithArchitectAI(messages);

        if (stream) {
            res.setHeader("Content-Type", "text/event-stream");
            res.setHeader("Cache-Control", "no-cache");
            res.setHeader("Connection", "keep-alive");

            for await (const chunk of chatStream) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
                }
            }

            res.write("data: [DONE]\n\n");
            res.end();
            return;
        }

        let fullText = "";
        for await (const chunk of chatStream) {
            fullText += chunk.choices[0]?.delta?.content || "";
        }

        res.json({ text: fullText });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/summarize-consultation", authenticate, async (req, res) => {
    try {
        const summary = await summarizeConsultationRequest(req.body.consultation);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/summarize-project", authenticate, async (req, res) => {
    try {
        const summary = await summarizeProjectWorkspace(req.body.project);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// ── Avora Estimate ────────────────────────────────────────────
router.post("/avora-estimate", authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const input = req.body;
        if (!input.city || !input.plotSize || !input.floors) {
            return res.status(400).json({ error: "city, plotSize, and floors are required" });
        }

        const report = await generateAvoraEstimate(input);
        logger.ai("avora-estimate-generated", { userId, city: input.city, floors: input.floors, tier: input.interiorTier });

        // Persist estimate
        try {
            if (!prisma.avoraEstimate) {
                throw new Error("Prisma avoraEstimate model not initialized. Run 'prisma generate' to regenerate client.");
            }
            const saved = await prisma.avoraEstimate.create({
                data: {
                    homeownerId: userId,
                    city: input.city,
                    locationType: input.locationType,
                    plotSize: Number(input.plotSize),
                    builtUpArea: input.builtUpArea ? Number(input.builtUpArea) : null,
                    floors: Number(input.floors),
                    timeline: input.timeline,
                    familySize: input.familySize ? Number(input.familySize) : null,
                    architectureStyle: input.architectureStyle,
                    lifestyleFeatures: input.lifestyleFeatures ?? [],
                    interiorTier: input.interiorTier,
                    vastuRequired: input.vastuRequired ?? false,
                    prayerRoom: input.prayerRoom ?? false,
                    courtyard: input.courtyard ?? false,
                    budgetMin: input.budgetMin ? Number(input.budgetMin) : null,
                    budgetMax: input.budgetMax ? Number(input.budgetMax) : null,
                    budgetFlexibility: input.budgetFlexibility,
                    materialPreference: input.materialPreference,
                    report: report as any,
                    status: "complete",
                },
            });
            res.json({ id: saved.id, report });
        } catch (dbError: any) {
            logger.error("Failed to persist Avora estimate", { error: dbError.message, userId });
            // Still return the report even if persistence fails
            res.json({ id: "temp_" + Date.now(), report, warning: "Report generated but not saved to database" });
        }
    } catch (error: any) {
        console.error("Avora estimate error:", error);
        res.status(500).json({ error: error.message || "Estimation failed" });
    }
});

router.get("/avora-estimates", authenticate, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        if (!prisma.avoraEstimate) {
            return res.status(500).json({ error: "Database model not initialized. Prisma client not properly generated." });
        }

        const estimates = await prisma.avoraEstimate.findMany({
            where: { homeownerId: userId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        res.json(estimates);
    } catch (error: any) {
        logger.error("Failed to fetch Avora estimates", { error: error.message, userId: req.user?.id });
        res.status(500).json({ error: error.message || "Failed to fetch estimates" });
    }
});

// ── Project Copilot ───────────────────────────────────────────
router.post("/project-health", authenticate, async (req, res) => {
    try {
        const health = await generateProjectHealth(req.body);
        res.json(health);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/consultation-brief", authenticate, async (req, res) => {
    try {
        const brief = await generateConsultationBrief(req.body.consultation);
        res.json({ brief });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post("/smart-notification", authenticate, async (req, res) => {
    try {
        const { eventType, context } = req.body;
        const text = await generateSmartNotificationText(eventType, context || {});
        res.json({ text });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;

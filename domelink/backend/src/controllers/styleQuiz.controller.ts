import type { Request, Response } from "express";
import { ArchitectModel } from "../models/Architect.js";
import { matchArchitectsByStyle } from "../utils/styleMatcher.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { logger } from "../utils/logger.js";

export const getStyleRecommendations = asyncHandler(async (req: Request, res: Response) => {
  // Assume quizResult is sent as query param: ?tags=modern,minimalist
  const tags = (req.query.tags as string)?.split(",")?.map(t => t.trim()).filter(Boolean) || [];
  if (!tags.length) return res.status(400).json({ error: "No style tags provided" });

  let architects;
  try {
    architects = await ArchitectModel.find({ styleTags: { $in: tags } }).lean();
  } catch (err: any) {
    logger.warn("MongoDB error in getStyleRecommendations", { error: err.message });
    return res.status(503).json({ error: "Style recommendation service temporarily unavailable" });
  }

  const ranked = matchArchitectsByStyle(architects, tags);
  res.json({ architects: ranked });
});

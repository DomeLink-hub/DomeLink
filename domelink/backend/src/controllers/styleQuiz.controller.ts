import type { Request, Response } from "express";
import { ArchitectModel } from "../models/Architect.js";
import { matchArchitectsByStyle } from "../utils/styleMatcher.js";

export const getStyleRecommendations = async (req: Request, res: Response) => {
  // Assume quizResult is sent as query param: ?tags=modern,minimalist
  const tags = (req.query.tags as string)?.split(",")?.map(t => t.trim()).filter(Boolean) || [];
  if (!tags.length) return res.status(400).json({ error: "No style tags provided" });

  const architects = await ArchitectModel.find({ styleTags: { $in: tags } }).lean();
  const ranked = matchArchitectsByStyle(architects, tags);
  res.json({ architects: ranked });
};

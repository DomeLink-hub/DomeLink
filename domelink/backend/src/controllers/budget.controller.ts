import { Request, Response } from "express";
import { z } from "zod";
import { ArchitectModel } from "../models/Architect.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const budgetRealitySchema = z.object({
  budget: z.number().min(1),
  plotSize: z.string().min(1),
  projectType: z.string().min(1),
});

export const budgetRealityCheck = asyncHandler(async (req: Request, res: Response) => {
  const { budget, projectType } = budgetRealitySchema.parse(req.body);

  // Find architects/projects matching type and plot size
  const architects = await ArchitectModel.find({
    specialty: { $regex: projectType, $options: "i" },
  });

  // Analyze budget vs. architect starting prices
  const affordable = architects.filter(a => a.startingPrice <= budget);
  const minPrice = architects.reduce((min, a) => Math.min(min, a.startingPrice), Infinity);
  const maxPrice = architects.reduce((max, a) => Math.max(max, a.startingPrice), 0);

  let message = "";
  const suggestions: string[] = [];
  if (affordable.length > 0) {
    message = `Your budget is realistic! You can work with ${affordable.length} architect(s) for a ${projectType} project.`;
    if (budget < minPrice + (maxPrice - minPrice) * 0.2) {
      suggestions.push("Consider increasing your budget for more options or premium architects.");
    }
  } else {
    message = `Your budget is below the minimum for a ${projectType} project. The lowest starting price is $${minPrice}.`;
    suggestions.push("Increase your budget or adjust your project scope.");
  }

  res.json({ message, suggestions });
});

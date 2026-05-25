/// <reference path="../types/express.d.ts" />
import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

// Allowed values for validation
const allowedCities = [
  "Bangalore", "Mumbai", "Pune", "Hyderabad", "Chennai", "Kochi", "Ahmedabad", "Jaipur", "Delhi", "Gurgaon"
];
const allowedProjectTypes = [
  "Villa", "Apartment", "Farmhouse", "Interior Renovation", "Commercial Space", "Office", "Cafe", "Retail"
];
const allowedStyles = [
  "Modern Minimal", "Contemporary Indian", "Tropical", "Brutalist", "Luxury Villa", "Sustainable", "Courtyard", "Scandinavian", "Japandi"
];
const allowedTimelines = [
  "Immediately", "3-6 months", "6-12 months", "Planning Stage"
];

const onboardingSchema = z.object({
  city: z.enum(allowedCities as [string, ...string[]]),
  projectType: z.enum(allowedProjectTypes as [string, ...string[]]),
  plotSize: z.coerce.number().int().positive(),
  budgetMin: z.coerce.number().int().nonnegative(),
  budgetMax: z.coerce.number().int().nonnegative(),
  preferredStyles: z.array(z.enum(allowedStyles as [string, ...string[]])).min(1),
  vastuPreference: z.coerce.boolean().default(false),
  timeline: z.enum(allowedTimelines as [string, ...string[]]),
  familySize: z.coerce.number().int().min(1),
  projectStage: z.string().trim().min(1),
});

export const submitHomeownerOnboarding = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== Role.CLIENT) {
      return res.status(403).json({ message: "Only homeowners can complete onboarding." });
    }
    const parsed = onboardingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid onboarding payload.",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const {
      city,
      projectType,
      plotSize,
      budgetMin,
      budgetMax,
      preferredStyles,
      vastuPreference,
      timeline,
      familySize,
      projectStage,
    } = parsed.data;

    if (budgetMax < budgetMin) {
      return res.status(400).json({ message: "Budget max must be greater than or equal to budget min." });
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        city,
        projectType,
        plotSize,
        budgetMin,
        budgetMax,
        preferredStyles,
        vastuPreference,
        timeline,
        familySize,
        projectStage,
        onboardingCompleted: true
      }
    });
    return res.status(200).json({ message: "Onboarding completed.", user: updated });
  } catch (e) {
    console.error("ONBOARDING ERROR:", e);
    return res.status(500).json({ message: "Server error during onboarding." });
  }
};

export const getOnboardingState = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    return res.status(200).json({
      onboardingCompleted: user.onboardingCompleted,
      onboarding: {
        city: user.city,
        projectType: user.projectType,
        plotSize: user.plotSize,
        budgetMin: user.budgetMin,
        budgetMax: user.budgetMax,
        preferredStyles: user.preferredStyles,
        vastuPreference: user.vastuPreference,
        timeline: user.timeline,
        familySize: user.familySize,
        projectStage: user.projectStage
      }
    });
  } catch (e) {
    console.error("GET ONBOARDING ERROR:", e);
    return res.status(500).json({ message: "Server error." });
  }
};

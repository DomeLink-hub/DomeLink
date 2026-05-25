import { groq, DEFAULT_MODEL } from "./groq.js";
import { generateBudgetReality } from "./budgetEngine.service.js";
import { aiCache, cacheKey } from "../cache/aiCache.service.js";
import { logger } from "../../utils/logger.js";

export interface AvoraInput {
  city: string;
  locationType?: string;
  plotSize: number;
  builtUpArea?: number;
  floors: number;
  timeline?: string;
  familySize?: number;
  architectureStyle?: string;
  lifestyleFeatures?: string[];
  interiorTier?: string;
  vastuRequired?: boolean;
  prayerRoom?: boolean;
  courtyard?: boolean;
  budgetMin?: number;
  budgetMax?: number;
  budgetFlexibility?: string;
  materialPreference?: string;
}

export interface AvoraReport {
  costRange: { min: number; max: number; currency: string };
  complexityScore: number;
  readinessScore: number;
  estimatedTimeline: string;
  architectTier: string;
  spacePlanning: string[];
  climateSuggestions: string[];
  sustainabilitySuggestions: string[];
  materialRecommendations: string[];
  interiorDirection: string;
  riskFactors: string[];
  budgetFeasibility: string;
  constructionDifficulty: string;
  designSummary: string;
  consultationPath: string;
  nextActions: string[];
  aiBudgetBreakdown: {
    construction: number;
    architecture: number;
    interiors: number;
    addOns: number;
    total: number;
    builtUpArea: number;
    psfRate: number;
    breakdown: {
      structure: number;
      finishing: number;
      mep: number;
      facade: number;
      landscape: number;
      addOns: number;
    };
  };
}

const qualityTierFromInterior = (tier?: string): "Essential" | "Premium" | "Luxury" => {
  if (!tier) return "Premium";
  const t = tier.toLowerCase();
  if (t.includes("ultra") || t.includes("luxury")) return "Luxury";
  if (t.includes("premium")) return "Premium";
  return "Essential";
};

const budgetFeasibilityFromData = (
  budgetMin: number, budgetMax: number, estimated: number
): string => {
  if (!budgetMin || !budgetMax) return "Unspecified";
  const midBudget = (budgetMin + budgetMax) / 2;
  const ratio = estimated / midBudget;
  if (ratio <= 0.85) return "Well Within Budget";
  if (ratio <= 1.0)  return "Feasible";
  if (ratio <= 1.2)  return "Tight";
  if (ratio <= 1.5)  return "Ambitious";
  return "Requires Revision";
};

export const generateAvoraEstimate = async (input: AvoraInput): Promise<AvoraReport> => {
  // Check cache first — identical inputs return cached report
  const key = cacheKey("avora", input as unknown as Record<string, unknown>);
  const cached = aiCache.get<AvoraReport>(key);
  if (cached) {
    logger.ai("avora-estimate-cache-hit", { city: input.city });
    return cached;
  }

  const qualityTier = qualityTierFromInterior(input.interiorTier);

  const budgetData = generateBudgetReality({
    city: input.city,
    plotSizeSqFt: input.plotSize,
    floors: input.floors,
    projectType: "Residential",
    qualityTier,
    interiorsIncluded: true,
    vastuRequirements: input.vastuRequired ?? false,
    lifestyleFeatures: input.lifestyleFeatures ?? [],
    locationType: input.locationType,
    materialPreference: input.materialPreference,
  });

  const deterministic_feasibility = budgetFeasibilityFromData(
    input.budgetMin ?? 0,
    input.budgetMax ?? 0,
    budgetData.totalEstimatedCost
  );

  const prompt = `You are Avora, DomeLink's architectural intelligence engine. You produce precise, grounded feasibility analysis for Indian residential projects.

PROJECT PROFILE:
City: ${input.city} (${input.locationType ?? "Urban"})
Plot: ${input.plotSize} sq ft | Built-up: ${budgetData.builtUpArea} sq ft | Floors: ${input.floors}
Family: ${input.familySize ?? "Not specified"} members | Timeline: ${input.timeline ?? "Not specified"}
Style: ${input.architectureStyle ?? "Modern"} | Interior Tier: ${input.interiorTier ?? "Premium"}
Features: ${(input.lifestyleFeatures ?? []).join(", ") || "Standard"}
Cultural: Vastu ${input.vastuRequired ? "required" : "not required"}${input.prayerRoom ? ", prayer room" : ""}${input.courtyard ? ", courtyard" : ""}
Material: ${input.materialPreference ?? "Standard"}
Budget: ₹${(input.budgetMin ?? 0).toLocaleString()} – ₹${(input.budgetMax ?? 0).toLocaleString()} (${input.budgetFlexibility ?? "Moderate"} flexibility)
Avora Cost Estimate: ₹${budgetData.totalEstimatedCost.toLocaleString()} | PSF: ₹${budgetData.psfRate}/sq ft
Budget Feasibility: ${deterministic_feasibility}

Respond ONLY with valid JSON:
{
  "complexityScore": <1-10, integer>,
  "readinessScore": <1-10, integer, how ready the project is to proceed>,
  "architectTier": "<Essential Studio | Premium Studio | Luxury Atelier | Ultra Luxury Firm>",
  "spacePlanning": ["<3 specific spatial recommendations for this project>"],
  "climateSuggestions": ["<2 climate-specific design strategies for ${input.city}>"],
  "sustainabilitySuggestions": ["<2 sustainability measures appropriate to this budget tier>"],
  "materialRecommendations": ["<3 specific materials suited to ${input.architectureStyle ?? "Modern"} style and ${input.city} climate>"],
  "interiorDirection": "<35-word max, specific to the style and tier chosen>",
  "riskFactors": ["<2 realistic project-specific risks>"],
  "constructionDifficulty": "<Standard | Moderate | Complex | Highly Complex>",
  "designSummary": "<2 sentences, architectural tone, specific to this project>",
  "consultationPath": "<Avora Standard | Avora Premium | Avora Signature>",
  "nextActions": ["<3 concrete next steps for this homeowner>"]
}

Rules: Be specific to ${input.city}, ${input.architectureStyle ?? "Modern"} style, and ${qualityTier} tier. No generic advice. Architectural tone only.`;

  let aiInsights: Partial<AvoraReport> = {};

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
      temperature: 0.25,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });
    const raw = response.choices[0]?.message?.content || "{}";
    aiInsights = JSON.parse(raw);
  } catch (err) {
    // Structured fallback — grounded, no AI hallucination
    const isLuxury = qualityTier === "Luxury";
    aiInsights = {
      complexityScore: isLuxury ? 8 : 6,
      readinessScore: 7,
      architectTier: isLuxury ? "Luxury Atelier" : "Premium Studio",
      spacePlanning: [
        "Double-height living volume with clerestory light",
        "Service core separation for clean spatial flow",
        "Flexible multi-generational bedroom configuration",
      ],
      climateSuggestions: [
        `Shaded east-west orientation to reduce solar gain in ${input.city}`,
        "Permeable landscape to manage monsoon runoff",
      ],
      sustainabilitySuggestions: [
        "Rooftop solar array sized for 60% energy offset",
        "Dual-flush plumbing with greywater recycling loop",
      ],
      materialRecommendations: [
        "Fly-ash brick with lime plaster for thermal mass",
        "Teak or engineered timber for interior joinery",
        "Polished Kota stone for ground-floor flooring",
      ],
      interiorDirection: `A material-led interior with spatial restraint — warm stone, timber, and considered light for a ${input.architectureStyle ?? "Modern"} sensibility.`,
      riskFactors: [
        "Municipal approval timelines vary significantly by zone",
        "Premium material lead times of 8–14 weeks should be factored into scheduling",
      ],
      constructionDifficulty: isLuxury ? "Complex" : "Moderate",
      designSummary: `A ${input.floors}-floor ${input.architectureStyle ?? "modern"} residence in ${input.city} with strong spatial logic and considered material choices. The project scale and specification align well with the ${qualityTier.toLowerCase()} tier.`,
      consultationPath: isLuxury ? "Avora Signature" : "Avora Premium",
      nextActions: [
        "Commission a topographic and soil survey of the plot",
        "Shortlist 2–3 architects from the Avora-matched recommendations",
        "Prepare a detailed brief document using the DomeLink Project Brief tool",
      ],
    };
  }

  const costMin = Math.round(budgetData.totalEstimatedCost * 0.88);
  const costMax = Math.round(budgetData.totalEstimatedCost * 1.18);

  const result: AvoraReport = {
    costRange: { min: costMin, max: costMax, currency: "INR" },
    complexityScore:    aiInsights.complexityScore    ?? 6,
    readinessScore:     aiInsights.readinessScore     ?? 7,
    estimatedTimeline:  `${budgetData.estimatedProjectTimelineMonths} months`,
    architectTier:      aiInsights.architectTier      ?? "Premium Studio",
    spacePlanning:      aiInsights.spacePlanning       ?? [],
    climateSuggestions: aiInsights.climateSuggestions ?? [],
    sustainabilitySuggestions: aiInsights.sustainabilitySuggestions ?? [],
    materialRecommendations:   aiInsights.materialRecommendations   ?? [],
    interiorDirection:  aiInsights.interiorDirection  ?? "",
    riskFactors:        aiInsights.riskFactors         ?? [],
    budgetFeasibility:  deterministic_feasibility,
    constructionDifficulty: aiInsights.constructionDifficulty ?? "Moderate",
    designSummary:      aiInsights.designSummary       ?? "",
    consultationPath:   aiInsights.consultationPath    ?? "Avora Premium",
    nextActions:        aiInsights.nextActions         ?? [],
    aiBudgetBreakdown: {
      construction: budgetData.estimatedConstructionCost,
      architecture: budgetData.architectFeeEstimate,
      interiors:    budgetData.interiorsEstimate,
      addOns:       budgetData.addOnsCost,
      total:        budgetData.totalEstimatedCost,
      builtUpArea:  budgetData.builtUpArea,
      psfRate:      budgetData.psfRate,
      breakdown:    budgetData.breakdown,
    },
  };

  // Cache for 10 minutes — same inputs produce same deterministic result
  aiCache.set(key, result, 10 * 60 * 1000);
  logger.ai("avora-estimate-generated", { city: input.city, tier: qualityTier });
  return result;
};

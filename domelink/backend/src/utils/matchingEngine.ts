import type { SavedArchitect } from "@prisma/client";

export interface MatchingPreferences {
  budgetMin?: number;
  budgetMax?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
  city?: string;
  projectType?: string;
  requireVerified?: boolean;
  preferFeatured?: boolean;
  // Avora-enhanced signals
  complexityScore?: number;   // 1-10
  interiorTier?: string;      // Essential | Premium | Luxury | Ultra Luxury
  vastuRequired?: boolean;
  sustainabilityFocus?: boolean;
  architectTier?: string;     // Essential Studio | Premium Studio | Luxury Atelier | Ultra Luxury Firm
}

const normalize = (value?: string) => (value || "").toLowerCase();

const asArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (typeof value === "string" && value.length > 0) return [value];
  return [];
};

const getField = (architect: any, key: string) =>
  (architect as Record<string, unknown>)[key];

/* ── Individual scorers ──────────────────────────────────────── */

const scoreBudget = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.budgetMin && !prefs.budgetMax) return 0.3;
  const min = prefs.budgetMin ?? 0;
  const max = prefs.budgetMax ?? Number.MAX_SAFE_INTEGER;
  const startingBudget = Number(architect.startingProjectBudget ?? architect.startingPrice ?? architect.consultationFee ?? 0);
  const maximumBudget = Number(architect.maximumProjectBudget ?? architect.startingProjectBudget ?? architect.startingPrice ?? 0);
  if (startingBudget === 0 && maximumBudget === 0) return 0.3; // no price set — neutral
  if ((startingBudget >= min && startingBudget <= max) || (maximumBudget >= min && maximumBudget <= max)) return 1.0;
  // Partial credit if within 30% of range
  const midBudget = (min + max) / 2;
  const ratio = startingBudget / midBudget;
  if (ratio >= 0.7 && ratio <= 1.4) return 0.5;
  return 0.1;
};

const scoreStyle = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.preferredStyle) return 0.3;
  const target = normalize(prefs.preferredStyle);
  const designStyles = asArray(getField(architect, "designStyles"));
  const workingStyles = asArray(getField(architect, "workingStyles"));
  const specialty = normalize(architect.specialty ?? "");
  const about = normalize(architect.about ?? "");
  if (designStyles.some((s) => normalize(s).includes(target)) || workingStyles.some((s) => normalize(s).includes(target))) return 1.0;
  if (specialty.includes(target) || about.includes(target)) return 0.7;
  return 0.15;
};

const scoreLocation = (architect: any, prefs: MatchingPreferences): number => {
  const target = normalize(prefs.location || prefs.city);
  if (!target) return 0.3;
  const location = normalize(architect.location ?? "");
  const citiesServed = asArray(getField(architect, "citiesServed"));
  const serviceCities = asArray(getField(architect, "serviceCities"));
  const city = normalize(getField(architect, "city") as string);
  const state = normalize(getField(architect, "state") as string);
  if (location.includes(target) || city.includes(target) || state.includes(target)) return 1.0;
  if (citiesServed.some((c) => normalize(c).includes(target)) || serviceCities.some((c) => normalize(c).includes(target))) return 0.9;
  return 0.1;
};

const scoreProjectType = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.projectType) return 0.35;
  const target = normalize(prefs.projectType);
  const projectTypes = asArray(getField(architect, "projectTypes"));
  const expertise = asArray(getField(architect, "expertise"));
  const servicesOffered = asArray(getField(architect, "servicesOffered"));
  const specialty = normalize(architect.specialty ?? "");
  if (projectTypes.some((p) => normalize(p).includes(target)) || expertise.some((p) => normalize(p).includes(target)) || servicesOffered.some((p) => normalize(p).includes(target))) return 1.0;
  if (specialty.includes(target)) return 0.8;
  return 0.2;
};

const scoreVerification = (architect: any, prefs: MatchingPreferences): number => {
  const isVerified = Boolean(getField(architect, "isVerified"));
  if (prefs.requireVerified) return isVerified ? 1.0 : 0.0;
  return isVerified ? 0.9 : 0.4;
};

const scoreFeatured = (architect: any, prefs: MatchingPreferences): number => {
  const isFeatured = Boolean(getField(architect, "isFeatured"));
  if (prefs.preferFeatured) return isFeatured ? 1.0 : 0.3;
  return isFeatured ? 0.75 : 0.5;
};

const scoreRating = (architect: any): number => {
  const rating = Number(getField(architect, "rating") ?? 0);
  if (!rating) return 0.35;
  return Math.min(Math.max(rating / 5, 0.35), 1.0);
};

const scoreTrustScore = (architect: any): number => {
  const trust = Number(getField(architect, "trustScore") ?? 0);
  if (!trust) return 0.3;
  return Math.min(trust / 100, 1.0);
};

const scoreInteractions = (
  architect: any,
  saved: SavedArchitect[],
  consultations: any[],
): number => {
  const id = (architect as { _id?: unknown; id?: string })._id ?? architect.id;
  const savedScore = saved.some((s) => String(s.architectId) === String(id)) ? 0.5 : 0;
  const consultScore = consultations.some((c) => String(c.architectId) === String(id)) ? 0.5 : 0;
  return savedScore + consultScore;
};

/* ── Avora-specific scorers ──────────────────────────────────── */

const scoreComplexityFit = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.complexityScore) return 0.5;
  const completedProjects = Number(getField(architect, "completedProjects") ?? 0);
  const experience = normalize(architect.experience ?? "");
  const yearsOfExperience = Number(getField(architect, "yearsOfExperience") ?? 0);
  // High complexity (7+) needs experienced architects
  if (prefs.complexityScore >= 7) {
    if (completedProjects >= 20 || yearsOfExperience >= 10 || experience.includes("10") || experience.includes("15") || experience.includes("20")) return 1.0;
    if (completedProjects >= 10) return 0.7;
    return 0.3;
  }
  // Low complexity — any architect is fine
  return 0.7;
};

const scoreLuxuryTier = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.interiorTier && !prefs.architectTier) return 0.5;
  const tier = normalize(prefs.interiorTier ?? prefs.architectTier ?? "");
  const designStyles = asArray(getField(architect, "designStyles"));
  const workingStyles = asArray(getField(architect, "workingStyles"));
  const specialty = normalize(architect.specialty ?? "");
  const about = normalize(architect.about ?? "");
  const isLuxury = tier.includes("luxury") || tier.includes("ultra");
  const isPremium = tier.includes("premium");

  if (isLuxury) {
    const luxuryKeywords = ["luxury", "premium", "high-end", "bespoke", "villa", "award"];
    const hasLuxury = luxuryKeywords.some((k) =>
      specialty.includes(k) || about.includes(k) || designStyles.some((s) => normalize(s).includes(k)) || workingStyles.some((s) => normalize(s).includes(k))
    );
    return hasLuxury ? 1.0 : 0.3;
  }
  if (isPremium) {
    return 0.7; // most architects qualify for premium
  }
  return 0.6;
};

const scoreVastu = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.vastuRequired) return 0.5;
  const about = normalize(architect.about ?? "");
  const designStyles = asArray(getField(architect, "designStyles"));
  const workingStyles = asArray(getField(architect, "workingStyles"));
  const hasVastu = about.includes("vastu") || designStyles.some((s) => normalize(s).includes("vastu") || normalize(s).includes("traditional") || normalize(s).includes("indian")) || workingStyles.some((s) => normalize(s).includes("traditional"));
  return hasVastu ? 1.0 : 0.4;
};

const scoreSustainability = (architect: any, prefs: MatchingPreferences): number => {
  if (!prefs.sustainabilityFocus) return 0.5;
  const about = normalize(architect.about ?? "");
  const designStyles = asArray(getField(architect, "designStyles"));
  const workingStyles = asArray(getField(architect, "workingStyles"));
  const hasSustainability = about.includes("sustain") || about.includes("green") || about.includes("eco") ||
    designStyles.some((s) => normalize(s).includes("sustain") || normalize(s).includes("green")) || workingStyles.some((s) => normalize(s).includes("sustain") || normalize(s).includes("green"));
  return hasSustainability ? 1.0 : 0.4;
};

/* ── Main ranking function ───────────────────────────────────── */
export const rankArchitects = (
  architects: any[],
  prefs: MatchingPreferences,
  saved: SavedArchitect[],
  consultations: any[],
): any[] => {
  const hasAvoraSignals = !!(prefs.complexityScore || prefs.interiorTier || prefs.architectTier || prefs.vastuRequired || prefs.sustainabilityFocus);

  return architects
    .map((architect) => {
      let score: number;

      if (hasAvoraSignals) {
        // Avora-enhanced weighting
        score =
          scoreBudget(architect, prefs)          * 0.18 +
          scoreStyle(architect, prefs)            * 0.15 +
          scoreLocation(architect, prefs)         * 0.14 +
          scoreProjectType(architect, prefs)      * 0.10 +
          scoreVerification(architect, prefs)     * 0.08 +
          scoreFeatured(architect, prefs)         * 0.05 +
          scoreRating(architect)                  * 0.06 +
          scoreTrustScore(architect)              * 0.04 +
          scoreInteractions(architect, saved, consultations) * 0.05 +
          // Avora signals
          scoreComplexityFit(architect, prefs)    * 0.08 +
          scoreLuxuryTier(architect, prefs)       * 0.04 +
          scoreVastu(architect, prefs)            * 0.02 +
          scoreSustainability(architect, prefs)   * 0.01;
      } else {
        // Standard weighting
        score =
          scoreBudget(architect, prefs)          * 0.20 +
          scoreStyle(architect, prefs)            * 0.18 +
          scoreLocation(architect, prefs)         * 0.15 +
          scoreProjectType(architect, prefs)      * 0.12 +
          scoreVerification(architect, prefs)     * 0.10 +
          scoreFeatured(architect, prefs)         * 0.08 +
          scoreRating(architect)                  * 0.07 +
          scoreTrustScore(architect)              * 0.05 +
          scoreInteractions(architect, saved, consultations) * 0.05;
      }

      return { architect, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.architect);
};

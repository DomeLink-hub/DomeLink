import type { ArchitectDocument } from "../models/Architect.js";
import type { ConsultationDocument } from "../models/Consultation.js";
import type { SavedArchitectDocument } from "../models/SavedArchitect.js";

export interface MatchingPreferences {
  budgetMin?: number;
  budgetMax?: number;
  plotSize?: string;
  preferredStyle?: string;
  location?: string;
}

const normalize = (value?: string) => (value || "").toLowerCase();

const scoreBudget = (architect: ArchitectDocument, prefs: MatchingPreferences) => {
  if (!prefs.budgetMin && !prefs.budgetMax) return 0.2;
  const min = prefs.budgetMin ?? 0;
  const max = prefs.budgetMax ?? Number.MAX_SAFE_INTEGER;
  return architect.startingPrice >= min && architect.startingPrice <= max ? 1 : 0.2;
};

const scoreStyle = (architect: ArchitectDocument, prefs: MatchingPreferences) => {
  if (!prefs.preferredStyle) return 0.3;
  const target = normalize(prefs.preferredStyle);
  const styleMatch = architect.styleTags.some((tag) => normalize(tag).includes(target));
  const specialtyMatch = normalize(architect.specialty).includes(target);
  return styleMatch || specialtyMatch ? 1 : 0.2;
};

const scoreLocation = (architect: ArchitectDocument, prefs: MatchingPreferences) => {
  if (!prefs.location) return 0.2;
  const target = normalize(prefs.location);
  return normalize(architect.location).includes(target) ? 1 : 0.2;
};

const scorePlotSize = (_architect: ArchitectDocument, prefs: MatchingPreferences) => {
  if (!prefs.plotSize) return 0.2;
  return 0.6;
};

const scoreInteractions = (
  architect: ArchitectDocument,
  saved: SavedArchitectDocument[],
  consultations: ConsultationDocument[],
) => {
  const architectId = (architect as { _id?: unknown; id?: string })._id ?? (architect as { id?: string }).id;
  const savedScore = saved.some((item) => String(item.architectId) === String(architectId)) ? 0.5 : 0;
  const consultScore = consultations.some((item) => String(item.architectId) === String(architectId)) ? 0.5 : 0;
  return savedScore + consultScore;
};

export const rankArchitects = (
  architects: ArchitectDocument[],
  prefs: MatchingPreferences,
  saved: SavedArchitectDocument[],
  consultations: ConsultationDocument[],
) => {
  return architects
    .map((architect) => {
      const score =
        scoreBudget(architect, prefs) * 0.3 +
        scoreStyle(architect, prefs) * 0.25 +
        scoreLocation(architect, prefs) * 0.2 +
        scorePlotSize(architect, prefs) * 0.1 +
        scoreInteractions(architect, saved, consultations) * 0.15;
      return { architect, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((entry) => entry.architect);
};

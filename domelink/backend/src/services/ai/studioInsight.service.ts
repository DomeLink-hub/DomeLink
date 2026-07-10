/**
 * Studio Insight aggregation service.
 * Derives 2–4 insight tags from the architect's real consultation and lead history.
 * Pure Prisma aggregation — no AI call needed for statistical patterns like
 * "most requested style" or "budget concentration". This keeps insights honest and fast.
 */

import prisma from "../../config/prisma.js";

const normalizeStringArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
};

/** Minimum data points before we'll show insights instead of the empty state */
const MIN_DATA_POINTS = 3;

export type StudioInsightResult = {
  hasEnoughData: false;
  reason: string;
} | {
  hasEnoughData: true;
  summary: string;
  tags: string[];
  meta: {
    totalConsultations: number;
    topStyle: string | null;
    topProjectType: string | null;
    topCity: string | null;
    avgBudgetLakh: number | null;
    activeProjects: number;
  };
};

export async function getStudioInsights(architectId: string): Promise<StudioInsightResult> {
  // Fetch last 30 consultations for this architect, including homeowner onboarding data
  const consultations = await prisma.consultation.findMany({
    where: { architectId },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: {
      id: true,
      projectType: true,
      budget: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          city: true,
          projectType: true,
          budgetMin: true,
          budgetMax: true,
          preferredStyles: true,
        },
      },
    },
  });

  const totalConsultations = consultations.length;

  if (totalConsultations < MIN_DATA_POINTS) {
    return {
      hasEnoughData: false,
      reason: `Only ${totalConsultations} consultation${totalConsultations === 1 ? "" : "s"} so far — insights will appear once you have ${MIN_DATA_POINTS}+.`,
    };
  }

  // Aggregate project types
  const projectTypeCounts = new Map<string, number>();
  const styleCounts = new Map<string, number>();
  const cityCounts = new Map<string, number>();
  const budgets: number[] = [];

  for (const c of consultations) {
    const pt = c.projectType || c.user.projectType;
    if (pt) projectTypeCounts.set(pt, (projectTypeCounts.get(pt) ?? 0) + 1);

    const styles = normalizeStringArray(c.user.preferredStyles);
    for (const s of styles) {
      styleCounts.set(s, (styleCounts.get(s) ?? 0) + 1);
    }

    const city = c.user.city;
    if (city) cityCounts.set(city, (cityCounts.get(city) ?? 0) + 1);

    const budget = c.budget ?? ((c.user.budgetMin && c.user.budgetMax) ? Math.round((c.user.budgetMin + c.user.budgetMax) / 2) : null);
    if (budget && budget > 0) budgets.push(budget);
  }

  const topEntry = <K,>(map: Map<K, number>): K | null => {
    let best: K | null = null;
    let bestCount = 0;
    for (const [key, count] of map) {
      if (count > bestCount) { bestCount = count; best = key; }
    }
    return best;
  };

  const topStyle = topEntry(styleCounts);
  const topProjectType = topEntry(projectTypeCounts);
  const topCity = topEntry(cityCounts);
  const avgBudgetLakh = budgets.length > 0
    ? Math.round(budgets.reduce((a, b) => a + b, 0) / budgets.length / 100_000)
    : null;

  // Active projects
  const activeProjects = await prisma.project.count({
    where: { architectId, status: { in: ["planning", "in_progress"] } },
  });

  // Build tags from real data
  const tags: string[] = [];

  if (topStyle) tags.push(topStyle);
  if (topProjectType && topProjectType !== topStyle) tags.push(topProjectType);
  if (topCity) tags.push(topCity);
  if (avgBudgetLakh !== null) {
    tags.push(avgBudgetLakh >= 100 ? "High-value briefs" : avgBudgetLakh >= 50 ? "Mid-range briefs" : "Entry-range briefs");
  }
  if (activeProjects > 0) tags.push(`${activeProjects} active project${activeProjects > 1 ? "s" : ""}`);

  // Keep to 4 max
  const finalTags = tags.slice(0, 4);

  // Build summary sentence
  const summaryParts: string[] = [];
  if (topProjectType) summaryParts.push(`Most requested: ${topProjectType}`);
  if (topStyle) summaryParts.push(`preferred style ${topStyle}`);
  if (topCity) summaryParts.push(`concentrated in ${topCity}`);
  if (avgBudgetLakh) summaryParts.push(`avg. budget ₹${avgBudgetLakh}L`);

  const summary = summaryParts.length > 0
    ? `Based on your last ${totalConsultations} consultations — ${summaryParts.join(", ")}.`
    : `Based on your last ${totalConsultations} consultations.`;

  return {
    hasEnoughData: true,
    summary,
    tags: finalTags,
    meta: { totalConsultations, topStyle, topProjectType, topCity, avgBudgetLakh, activeProjects },
  };
}

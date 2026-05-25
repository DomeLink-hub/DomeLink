/**
 * Avora Project Copilot Service
 * Generates contextual project intelligence, health scores, and next-action guidance.
 */
import { groq, DEFAULT_MODEL } from "./groq.js";

export interface ProjectHealthReport {
  riskScore: number;           // 0–100 (higher = more risk)
  timelineConfidence: number;  // 0–100
  communicationHealth: number; // 0–100
  budgetStability: number;     // 0–100
  momentumScore: number;       // 0–100
  completionProbability: number; // 0–100
  overallHealth: "Healthy" | "Needs Attention" | "At Risk" | "Critical";
  copilotInsights: string[];   // 2–4 contextual suggestions
  nextActions: string[];       // 2–3 concrete next steps
  summary: string;             // 1–2 sentence narrative
}

export interface CopilotContext {
  projectTitle?: string;
  status?: string;
  progress?: number;
  estimatedBudget?: number;
  estimatedTime?: string;
  milestones?: Array<{ title: string; status: string; dueDate?: string }>;
  consultationCount?: number;
  lastActivityDaysAgo?: number;
  paymentStatus?: string;
  homeownerCity?: string;
  architectureStyle?: string;
  complexity?: number; // 1–10
}

const safeJson = (text: string) => {
  try {
    return JSON.parse(text.replace(/```json/g, "").replace(/```/g, "").trim());
  } catch {
    return null;
  }
};

export const generateProjectHealth = async (ctx: CopilotContext): Promise<ProjectHealthReport> => {
  const completedMilestones = ctx.milestones?.filter(m => m.status === "completed").length ?? 0;
  const totalMilestones = ctx.milestones?.length ?? 0;
  const milestoneProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : ctx.progress ?? 0;

  const prompt = `You are Avora, DomeLink's architectural project intelligence engine.
Analyse this project and return a JSON health report.

PROJECT STATE:
- Title: ${ctx.projectTitle || "Residential Project"}
- Status: ${ctx.status || "planning"}
- Progress: ${milestoneProgress}%
- Milestones: ${completedMilestones}/${totalMilestones} completed
- Last activity: ${ctx.lastActivityDaysAgo ?? 0} days ago
- Consultations: ${ctx.consultationCount ?? 0}
- Budget: ₹${(ctx.estimatedBudget || 0).toLocaleString()}
- Timeline: ${ctx.estimatedTime || "Not set"}
- Complexity: ${ctx.complexity ?? 5}/10
- Style: ${ctx.architectureStyle || "Modern"}

Return ONLY valid JSON:
{
  "riskScore": <0-100>,
  "timelineConfidence": <0-100>,
  "communicationHealth": <0-100>,
  "budgetStability": <0-100>,
  "momentumScore": <0-100>,
  "completionProbability": <0-100>,
  "overallHealth": "<Healthy|Needs Attention|At Risk|Critical>",
  "copilotInsights": ["<insight 1>", "<insight 2>"],
  "nextActions": ["<action 1>", "<action 2>"],
  "summary": "<1-2 sentences, architectural tone>"
}

Rules: Be specific to the project state. Avoid generic advice. Architectural tone only.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
      temperature: 0.2,
      max_tokens: 500,
      response_format: { type: "json_object" },
    });

    const parsed = safeJson(response.choices[0]?.message?.content || "{}");
    if (parsed?.overallHealth) {
      return {
        riskScore:              Math.min(100, Math.max(0, Number(parsed.riskScore ?? 30))),
        timelineConfidence:     Math.min(100, Math.max(0, Number(parsed.timelineConfidence ?? 70))),
        communicationHealth:    Math.min(100, Math.max(0, Number(parsed.communicationHealth ?? 75))),
        budgetStability:        Math.min(100, Math.max(0, Number(parsed.budgetStability ?? 80))),
        momentumScore:          Math.min(100, Math.max(0, Number(parsed.momentumScore ?? 65))),
        completionProbability:  Math.min(100, Math.max(0, Number(parsed.completionProbability ?? 72))),
        overallHealth:          parsed.overallHealth,
        copilotInsights:        Array.isArray(parsed.copilotInsights) ? parsed.copilotInsights : [],
        nextActions:            Array.isArray(parsed.nextActions) ? parsed.nextActions : [],
        summary:                String(parsed.summary || ""),
      };
    }
  } catch { /* fall through to deterministic fallback */ }

  // Deterministic fallback — no AI call needed
  const inactivityRisk = (ctx.lastActivityDaysAgo ?? 0) > 14 ? 30 : 0;
  const milestoneRisk = milestoneProgress < 20 && (ctx.status === "in_progress") ? 20 : 0;
  const riskScore = Math.min(100, inactivityRisk + milestoneRisk + 20);
  const momentum = Math.max(10, 100 - inactivityRisk - milestoneRisk);

  return {
    riskScore,
    timelineConfidence: ctx.estimatedTime ? 75 : 45,
    communicationHealth: (ctx.lastActivityDaysAgo ?? 0) < 7 ? 85 : 55,
    budgetStability: ctx.estimatedBudget ? 80 : 50,
    momentumScore: momentum,
    completionProbability: Math.max(40, 100 - riskScore),
    overallHealth: riskScore > 60 ? "At Risk" : riskScore > 35 ? "Needs Attention" : "Healthy",
    copilotInsights: [
      (ctx.lastActivityDaysAgo ?? 0) > 10
        ? "Communication activity has slowed — consider scheduling a check-in with your architect."
        : "Communication cadence is healthy. Maintain regular touchpoints.",
      milestoneProgress < 30
        ? "Early-stage projects benefit from a clear milestone plan. Confirm the first three deliverables."
        : "Milestone progression is on track. Review the next phase scope.",
    ],
    nextActions: [
      "Confirm the next milestone and expected delivery date",
      "Review the project brief for any scope changes",
    ],
    summary: `Project is in ${ctx.status || "planning"} phase with ${milestoneProgress}% milestone completion. ${riskScore > 40 ? "Some attention required to maintain momentum." : "Progressing steadily."}`,
  };
};

export const generateConsultationBrief = async (consultation: any): Promise<string> => {
  const prompt = `You are Avora. Generate a concise architectural consultation brief (3–4 sentences, professional tone) from this data:
${JSON.stringify(consultation)}
Output only the brief text. No JSON. No headers.`;

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: DEFAULT_MODEL,
      temperature: 0.25,
      max_tokens: 150,
    });
    return response.choices[0]?.message?.content?.trim() || "Consultation brief unavailable.";
  } catch {
    return "A residential consultation has been initiated. The homeowner has outlined their project requirements and is seeking architectural guidance.";
  }
};

export const generateSmartNotificationText = async (
  eventType: string,
  context: Record<string, unknown>
): Promise<string> => {
  const templates: Record<string, string> = {
    file_shared:    `${context.studioName || "Your architect"} shared ${context.fileName || "new documents"} for your review.`,
    project_update: `Avora detected progress on ${context.phase || "project"} milestones. Review the latest updates.`,
    message_unread: `${context.senderName || "Your architect"} sent a message ${context.daysAgo ? `${context.daysAgo} days ago` : "recently"} — a response would keep the project moving.`,
    payment_due:    `A payment of ₹${context.amount || "—"} is due for ${context.phase || "the current project phase"}.`,
    milestone_due:  `"${context.milestoneTitle || "A milestone"}" is due ${context.daysUntil ? `in ${context.daysUntil} days` : "soon"}. Confirm readiness with your architect.`,
    inactivity:     `No project activity in ${context.days || 10} days. A brief check-in with ${context.architectName || "your architect"} would help maintain momentum.`,
  };

  return templates[eventType] || `Project update: ${eventType.replace(/_/g, " ")}.`;
};

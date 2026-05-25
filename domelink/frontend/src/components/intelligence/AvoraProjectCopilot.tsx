import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api, type ProjectHealthReport } from "@/lib/api";
import Reveal from "@/components/animations/Reveal";

/* ── Health gauge ────────────────────────────────────────────── */
const HealthGauge = ({ value, label, delay = 0 }: { value: number; label: string; delay?: number }) => {
  const color =
    value >= 75 ? "hsl(142 70% 45%)" :
    value >= 50 ? "hsl(38 92% 50%)" :
                  "hsl(0 72% 51%)";

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-caption text-muted-foreground">{label}</span>
        <span className="text-body-sm font-medium" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 bg-border/40 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
    </div>
  );
};

/* ── Health badge ────────────────────────────────────────────── */
const HealthBadge = ({ status }: { status: ProjectHealthReport["overallHealth"] }) => {
  const config = {
    "Healthy":          { color: "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300", dot: "bg-emerald-500" },
    "Needs Attention":  { color: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
    "At Risk":          { color: "text-orange-700 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
    "Critical":         { color: "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-700 dark:text-red-300", dot: "bg-red-500" },
  };
  const c = config[status] ?? config["Healthy"];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

/* ── Main component ──────────────────────────────────────────── */
interface AvoraProjectCopilotProps {
  projectId?: string;
  context?: {
    projectTitle?: string;
    status?: string;
    progress?: number;
    estimatedBudget?: number;
    estimatedTime?: string;
    milestones?: Array<{ title: string; status: string; dueDate?: string }>;
    consultationCount?: number;
    lastActivityDaysAgo?: number;
    architectureStyle?: string;
    complexity?: number;
  };
  compact?: boolean;
}

export default function AvoraProjectCopilot({ context, compact = false }: AvoraProjectCopilotProps) {
  const [expanded, setExpanded] = useState(false);

  const { data: health, isLoading } = useQuery({
    queryKey: ["project-health", JSON.stringify(context)],
    queryFn: () => api.getProjectHealth(context || {}),
    enabled: !!context,
    staleTime: 1000 * 60 * 10, // cache 10 min — avoid excessive AI calls
    retry: 1,
  });

  if (!context) return null;

  if (isLoading) {
    return (
      <div className="dome-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="dome-chip">Avora Copilot</span>
          <motion.span
            className="text-caption text-muted-foreground"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Analysing project…
          </motion.span>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-1.5 bg-border/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-border/60 rounded-full"
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!health) return null;

  if (compact) {
    return (
      <div className="dome-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="dome-kicker">Avora Copilot</span>
          <HealthBadge status={health.overallHealth} />
        </div>
        <p className="text-body-sm text-muted-foreground">{health.summary}</p>
        <div className="grid grid-cols-2 gap-3">
          <HealthGauge value={health.momentumScore} label="Momentum" delay={0.1} />
          <HealthGauge value={health.completionProbability} label="Completion" delay={0.2} />
        </div>
        {health.nextActions[0] && (
          <div className="pt-2 border-t border-border/40">
            <p className="text-caption text-muted-foreground mb-1">Next action</p>
            <p className="text-body-sm">{health.nextActions[0]}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <Reveal>
      <div className="dome-card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="dome-chip">Avora Copilot</span>
            <span className="text-caption text-muted-foreground">Project Intelligence</span>
          </div>
          <HealthBadge status={health.overallHealth} />
        </div>

        {/* Summary */}
        <p className="text-body text-muted-foreground">{health.summary}</p>

        {/* Health gauges */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <HealthGauge value={health.momentumScore}         label="Momentum"         delay={0.1} />
          <HealthGauge value={health.timelineConfidence}    label="Timeline"         delay={0.15} />
          <HealthGauge value={health.communicationHealth}   label="Communication"    delay={0.2} />
          <HealthGauge value={health.budgetStability}       label="Budget Stability" delay={0.25} />
          <HealthGauge value={health.completionProbability} label="Completion"       delay={0.3} />
          <HealthGauge value={Math.max(0, 100 - health.riskScore)} label="Risk Buffer" delay={0.35} />
        </div>

        {/* Copilot insights */}
        {health.copilotInsights.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/40">
            <p className="text-caption text-muted-foreground">Avora Insights</p>
            {health.copilotInsights.map((insight, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3 text-body-sm"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="dome-node mt-1.5 flex-shrink-0" />
                {insight}
              </motion.div>
            ))}
          </div>
        )}

        {/* Next actions */}
        {health.nextActions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/40">
            <p className="text-caption text-muted-foreground">Recommended Actions</p>
            {health.nextActions.map((action, i) => (
              <div key={i} className="flex items-start gap-3 text-body-sm">
                <span className="text-caption text-muted-foreground flex-shrink-0 w-5">0{i + 1}</span>
                {action}
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}

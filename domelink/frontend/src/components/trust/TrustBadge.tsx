import { motion } from "framer-motion";
import Reveal, { DepthCard } from "@/components/animations/Reveal";

export type VerificationTier = "government" | "portfolio" | "new";

interface TrustBadgeProps {
  verificationTier?: VerificationTier;
  trustScore?: number; // 0–100
  expertiseTags?: string[];
  responseSpeed?: string; // e.g. "< 2 hours"
  completionRate?: number; // 0–100
  compact?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<VerificationTier, { label: string; color: string; icon: string }> = {
  government: {
    label: "Government Verified",
    color: "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300",
    icon: "✦",
  },
  portfolio: {
    label: "Portfolio Reviewed",
    color: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300",
    icon: "◈",
  },
  new: {
    label: "New Studio",
    color: "bg-secondary border-border text-muted-foreground",
    icon: "◇",
  },
};

const TrustScoreMeter = ({ score }: { score: number }) => {
  const clamped = Math.max(0, Math.min(100, score));
  const color =
    clamped >= 80
      ? "hsl(142 70% 45%)"
      : clamped >= 60
      ? "hsl(38 92% 50%)"
      : "hsl(var(--muted-foreground))";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-caption text-muted-foreground">Trust Score</span>
        <span className="text-body-sm font-medium" style={{ color }}>
          {clamped}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
};

const TrustBadge = ({
  verificationTier = "new",
  trustScore = 0,
  expertiseTags = [],
  responseSpeed,
  completionRate,
  compact = false,
  className = "",
}: TrustBadgeProps) => {
  const tier = TIER_CONFIG[verificationTier];

  if (compact) {
    return (
      <div className={`flex items-center gap-2 flex-wrap ${className}`}>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${tier.color}`}
        >
          <span>{tier.icon}</span>
          {tier.label}
        </span>
        {trustScore > 0 && (
          <span className="dome-chip text-xs">Trust {trustScore}</span>
        )}
      </div>
    );
  }

  return (
    <DepthCard className={`dome-card p-6 space-y-5 ${className}`}>
      {/* Verification tier */}
      <div className="flex items-center justify-between gap-4">
        <span className="dome-kicker">Trust & Verification</span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${tier.color}`}
        >
          <span>{tier.icon}</span>
          {tier.label}
        </span>
      </div>

      {/* Trust score meter */}
      {trustScore > 0 && <TrustScoreMeter score={trustScore} />}

      {/* Expertise tags */}
      {expertiseTags.length > 0 && (
        <div className="space-y-2">
          <span className="text-caption text-muted-foreground">Expertise</span>
          <div className="flex flex-wrap gap-2">
            {expertiseTags.map((tag) => (
              <span key={tag} className="dome-chip text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Response speed + completion rate */}
      {(responseSpeed || completionRate !== undefined) && (
        <div className="grid grid-cols-2 gap-4 pt-1 border-t border-border/50">
          {responseSpeed && (
            <div>
              <span className="text-caption text-muted-foreground block mb-1">Response</span>
              <span className="text-body-sm font-medium">{responseSpeed}</span>
            </div>
          )}
          {completionRate !== undefined && (
            <div>
              <span className="text-caption text-muted-foreground block mb-1">Completion</span>
              <span className="text-body-sm font-medium">{completionRate}%</span>
            </div>
          )}
        </div>
      )}
    </DepthCard>
  );
};

export { TrustScoreMeter };
export default TrustBadge;

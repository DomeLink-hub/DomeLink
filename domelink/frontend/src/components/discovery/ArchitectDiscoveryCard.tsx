import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Heart, MapPin, Sparkles, Star } from "lucide-react";
import type { Architect } from "@/lib/api";

interface ArchitectDiscoveryCardProps {
  architect: Architect;
  saved?: boolean;
  reason?: string;
  compact?: boolean;
  onSave?: (architectId: string) => void;
  onUnsave?: (architectId: string) => void;
}

const formatCurrency = (value?: number) => {
  if (!value) return "On request";
  return `₹${value.toLocaleString("en-IN")}`;
};

const ArchitectDiscoveryCard = ({
  architect,
  saved,
  reason,
  compact,
  onSave,
  onUnsave,
}: ArchitectDiscoveryCardProps) => {
  const image = architect.heroImage || architect.profileImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80";
  const styles = (architect.workingStyles || architect.designStyles || architect.projectTypes || []).slice(0, 3);
  const cities = (architect.serviceCities || architect.citiesServed || []).slice(0, 2);
  const portfolioCount = architect.portfolioProjects?.length ?? architect.completedProjects ?? 0;

  return (
    <Link to={`/architect/${architect.slug}`} className="block h-full">
      <motion.article
        className="dome-card group overflow-hidden h-full border border-border/40 bg-background/70 backdrop-blur-sm"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={architect.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {architect.isVerified && (
                <span className="dome-chip inline-flex items-center gap-1 bg-foreground text-background">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {architect.isFeatured && (
                <span className="dome-chip inline-flex items-center gap-1 bg-background/90 text-foreground">
                  <Sparkles className="h-3.5 w-3.5" /> Featured
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-white backdrop-blur-sm">
              <Star className="h-3.5 w-3.5 fill-current text-amber-300" />
              <span className="text-caption text-white">{architect.rating?.toFixed(1) || "New"}</span>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex flex-wrap items-end justify-between gap-3 text-white">
              <div>
                <h3 className="text-display-sm leading-tight">{architect.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-body-sm text-white/75">
                  <MapPin className="h-3.5 w-3.5" />
                  {architect.location || cities[0] || "India"}
                </p>
              </div>
              <div className="text-right">
                <div className="text-caption text-white/60">Consultation</div>
                <div className="text-body-lg font-medium">{formatCurrency(architect.consultationFee || architect.startingPrice)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {styles.map((style) => (
              <span key={style} className="dome-chip">
                {style}
              </span>
            ))}
            {cities.map((city) => (
              <span key={city} className="dome-chip">
                {city}
              </span>
            ))}
          </div>

          <p className="line-clamp-2 text-body-sm text-muted-foreground">
            {architect.about || architect.specialty || "Studio profile and portfolio available on the full profile page."}
          </p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="dome-panel p-3">
              <div className="text-caption text-muted-foreground">Projects</div>
              <div className="mt-1 text-body font-medium">{portfolioCount}</div>
            </div>
            <div className="dome-panel p-3">
              <div className="text-caption text-muted-foreground">Trust</div>
              <div className="mt-1 text-body font-medium">{Math.round((architect.trustScore || 0) * 100)}%</div>
            </div>
            <div className="dome-panel p-3">
              <div className="text-caption text-muted-foreground">Completion</div>
              <div className="mt-1 text-body font-medium">{architect.profileCompletionPercentage ?? 0}%</div>
            </div>
          </div>

          {reason && <p className="text-caption text-muted-foreground">{reason}</p>}

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-caption text-muted-foreground">
              {architect.completedProjects ? `${architect.completedProjects.toLocaleString("en-IN")} completed` : "New on DomeLink"}
            </span>
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (saved) {
                  onUnsave?.(architect._id);
                } else {
                  onSave?.(architect._id);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-caption transition-colors hover:border-foreground hover:text-foreground"
            >
              <Heart className={saved ? "h-3.5 w-3.5 fill-current text-foreground" : "h-3.5 w-3.5"} />
              {saved ? "Saved" : compact ? "Save" : "Quick save"}
            </button>
          </div>
        </div>
      </motion.article>
    </Link>
  );
};

export default ArchitectDiscoveryCard;
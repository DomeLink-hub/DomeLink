import { ReactNode, Suspense } from "react";
import Parallax from "@/components/animations/Parallax";
import DomeHero3D from "./DomeHero3D";
import { cn } from "@/lib/utils";

interface DomeHeroProps {
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  imageUrl?: string;
  align?: "left" | "center";
  className?: string;
}

const DomeHero = ({
  kicker,
  title,
  subtitle,
  imageUrl,
  align = "left",
  className,
}: DomeHeroProps) => {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      {/* 3D Hero Scene (if no imageUrl) */}
      {!imageUrl && (
        <Suspense fallback={<div className="absolute inset-0 bg-neutral-900 animate-pulse" />}>
          <DomeHero3D />
        </Suspense>
      )}
      {imageUrl && (
        <div className="absolute inset-0">
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20" />
        </div>
      )}
      <div className={cn("relative z-10 px-6 md:px-10 lg:px-14", imageUrl ? "py-32 md:py-40" : "py-24 md:py-32")}>
        <div className={cn("max-w-4xl", align === "center" ? "mx-auto text-center" : "")}
        >
          {kicker && <span className={cn("dome-kicker", imageUrl ? "text-white/70" : "")}>{kicker}</span>}
          <Parallax strength={32}>
            <h1 className={cn("text-display-xl dome-bracket mt-6", imageUrl ? "text-white" : "")}>{title}</h1>
            {subtitle && (
              <p className={cn("text-body-lg mt-6 max-w-2xl", imageUrl ? "text-white/70" : "text-muted-foreground", align === "center" ? "mx-auto" : "")}
              >
                {subtitle}
              </p>
            )}
          </Parallax>
        </div>
      </div>
    </section>
  );
};

export default DomeHero;

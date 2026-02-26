import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
}

export const Container = ({ children, className, size = "default" }: ContainerProps) => {
  const sizeClasses = {
    default: "max-w-6xl",
    narrow: "max-w-4xl",
    wide: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <div className={cn("mx-auto w-full px-6 md:px-10 lg:px-14", sizeClasses[size], className)}>
      {children}
    </div>
  );
};

interface SectionProps {
  children: ReactNode;
  className?: string;
  padding?: "none" | "small" | "default" | "large";
}

export const Section = ({ children, className, padding = "default" }: SectionProps) => {
  const paddingClasses = {
    none: "",
    small: "py-12 md:py-16",
    default: "py-20 md:py-32",
    large: "py-32 md:py-48",
  };

  return (
    <section className={cn(paddingClasses[padding], className)}>
      {children}
    </section>
  );
};

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4;
  gap?: "small" | "default" | "large";
}

export const Grid = ({ children, className, cols = 2, gap = "default" }: GridProps) => {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gapClasses = {
    small: "gap-4 md:gap-6",
    default: "gap-6 md:gap-8 lg:gap-12",
    large: "gap-8 md:gap-12 lg:gap-16",
  };

  return (
    <div className={cn("grid", colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
};

export default { Container, Section, Grid };

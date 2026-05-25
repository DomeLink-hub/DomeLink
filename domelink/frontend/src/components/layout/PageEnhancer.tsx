import { useEffect, useMemo, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import gsap from "gsap";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Container, Section, Grid } from "@/components/layout/Layout";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import StudioScene from "@/components/3d/StudioScene";
import ProjectBrief3D from "@/components/3d/ProjectBrief3D";

const PageEnhancer = () => {
  const location = useLocation();
  const rootRef = useRef<HTMLDivElement | null>(null);

  const variant = useMemo(() => {
    if (location.pathname.startsWith("/architect")) return "architect";
    if (location.pathname.startsWith("/homeowner")) return "homeowner";
    return "marketing";
  }, [location.pathname]);

  const chartData = useMemo(
    () => [
      { label: "Week 1", value: 32 },
      { label: "Week 2", value: 48 },
      { label: "Week 3", value: 54 },
      { label: "Week 4", value: 72 },
    ],
    [],
  );

  useEffect(() => {
    if (!rootRef.current) return;
    gsap.fromTo(
      rootRef.current.querySelectorAll("[data-animate]"),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.08, ease: "power3.out" },
    );
  }, [variant]);

  const headline =
    variant === "architect"
      ? "Studio Command Layer"
      : variant === "homeowner"
        ? "Home Planning Lab"
        : "Platform Momentum";

  const copy =
    variant === "architect"
      ? "Track pipeline health, team utilization, and design velocity with a live studio cockpit."
      : variant === "homeowner"
        ? "Model budget, timeline, and spatial intent with an interactive planning surface."
        : "See how DomeLink matches intent to expertise with curated, data-driven signals.";

  return (
    <div ref={rootRef}>
      <Section padding="small" className="bg-gradient-to-b from-background via-background to-muted/30">
        <Container>
          <div data-animate className="flex items-center justify-between gap-6 flex-wrap">
            <div>
              <span className="dome-kicker">Signal Room</span>
              <h2 className="text-display-sm mt-3">{headline}</h2>
              <p className="text-body text-muted-foreground mt-4 max-w-2xl">{copy}</p>
            </div>
            <Link to="/demo-dashboard" className="dome-button-outline">
              Open Live Demo
            </Link>
          </div>
          <Grid cols={3} gap="default" className="mt-10">
            <div data-animate className="dome-card p-6">
              <p className="text-caption text-muted-foreground">Active briefs</p>
              <p className="text-display-sm mt-3">186</p>
              <p className="text-body-sm text-muted-foreground mt-3">Real-time intake across premium clients.</p>
            </div>
            <div data-animate className="dome-card p-6">
              <p className="text-caption text-muted-foreground">Matching velocity</p>
              <p className="text-display-sm mt-3">3.4 hrs</p>
              <p className="text-body-sm text-muted-foreground mt-3">Average time to first architect shortlist.</p>
            </div>
            <div data-animate className="dome-card p-6">
              <p className="text-caption text-muted-foreground">Live consultations</p>
              <p className="text-display-sm mt-3">64</p>
              <p className="text-body-sm text-muted-foreground mt-3">Studios currently in active review.</p>
            </div>
          </Grid>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 mt-12">
            <div data-animate className="dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-display-sm">Engagement Curve</h3>
                <span className="text-caption text-muted-foreground">Demo</span>
              </div>
              <ChartContainer
                config={{
                  value: { label: "Momentum", color: "hsl(var(--primary))" },
                }}
                className="h-52"
              >
                <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div data-animate className="dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-display-sm">3D Workspace</h3>
                <span className="text-caption text-muted-foreground">Interactive</span>
              </div>
              {variant === "homeowner" ? (
                <ProjectBrief3D plotSize="48x72" style="modern" />
              ) : (
                <StudioScene className="h-64 w-full" />
              )}
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default PageEnhancer;

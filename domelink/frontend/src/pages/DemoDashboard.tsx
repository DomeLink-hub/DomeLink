
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { api, type AnalyticsSummary } from "@/lib/api";
import ProjectBrief3D from "@/components/3d/ProjectBrief3D";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

export default function DemoDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getAnalyticsSummary()
      .then((summary: AnalyticsSummary) => {
        const mapped: Record<string, number> = {};
        summary.byEvent.forEach(ev => { mapped[ev._id] = ev.count; });
        setStats({
          projects: summary.totals,
          messages: mapped["consultation_start"] || 0,
          reviews: mapped["review"] || 0,
          payments: mapped["payment"] || 0,
          files: mapped["file"] || 0,
          notifications: mapped["notification"] || 0,
        });
      })
      .catch(() => setError("Failed to load dashboard stats."))
      .finally(() => setLoading(false));
  }, []);

  const activityData = useMemo(
    () => [
      { day: "Mon", value: stats.messages ?? 0 },
      { day: "Tue", value: (stats.messages ?? 0) + 6 },
      { day: "Wed", value: (stats.messages ?? 0) + 14 },
      { day: "Thu", value: (stats.messages ?? 0) + 10 },
      { day: "Fri", value: (stats.messages ?? 0) + 18 },
      { day: "Sat", value: (stats.messages ?? 0) + 8 },
      { day: "Sun", value: (stats.messages ?? 0) + 12 },
    ],
    [stats.messages],
  );

  return (
    <PageTransition>
      <Header />
      <Section>
        <Container>
          <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-3">
            <span className="animate-spin text-cyan-500">📊</span> Demo Dashboard
          </h1>
          {loading && <div>Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <Grid cols={3} gap="default">
            <div className="dome-card p-6"><span className="text-caption">Projects</span><div className="text-2xl font-bold">{stats.projects ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Messages</span><div className="text-2xl font-bold">{stats.messages ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Reviews</span><div className="text-2xl font-bold">{stats.reviews ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Payments</span><div className="text-2xl font-bold">{stats.payments ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Files</span><div className="text-2xl font-bold">{stats.files ?? 0}</div></div>
            <div className="dome-card p-6"><span className="text-caption">Notifications</span><div className="text-2xl font-bold">{stats.notifications ?? 0}</div></div>
          </Grid>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 mt-12">
            <div className="dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-display-sm">Engagement Curve</h2>
                <span className="text-caption text-muted-foreground">Demo</span>
              </div>
              <ChartContainer
                config={{
                  value: { label: "Messages", color: "hsl(var(--primary))" },
                }}
                className="h-56"
              >
                <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
                </AreaChart>
              </ChartContainer>
            </div>
            <div className="dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-display-sm">3D Concept Preview</h2>
                <span className="text-caption text-muted-foreground">Interactive</span>
              </div>
              <ProjectBrief3D plotSize="50x70" style="modern" />
            </div>
          </div>
        </Container>
      </Section>
      <Footer />
    </PageTransition>
  );
}

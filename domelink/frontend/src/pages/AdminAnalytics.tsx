import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, XAxis, Bar, BarChart } from "recharts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const AdminAnalytics = () => {
  const [days, setDays] = useState(30);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["admin-analytics", days],
    queryFn: () => api.getAnalytics(days),
    staleTime: 1000 * 60 * 5,
  });

  const { data: summary } = useQuery({
    queryKey: ["admin-analytics-summary"],
    queryFn: api.getAnalyticsSummary,
    staleTime: 1000 * 60 * 5,
  });

  const { data: overview } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: api.getAdminOverview,
    staleTime: 1000 * 60 * 5,
  });

  const eventLookup = useMemo(() =>
    summary?.byEvent.reduce<Record<string, number>>((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}) ?? {},
  [summary]);

  const trend7  = summary?.daily7.reduce((a, d) => a + d.count, 0) ?? 0;
  const trend30 = summary?.daily30.reduce((a, d) => a + d.count, 0) ?? 0;

  // Conversion rate: consultations started / profile views
  const conversionRate = eventLookup.profile_view
    ? Math.round(((eventLookup.consultation_start ?? 0) / eventLookup.profile_view) * 100)
    : 0;

  // Daily trend chart data
  const trendData = useMemo(() =>
    (summary?.daily7 ?? []).map(d => ({
      label: new Date(d._id).toLocaleDateString(undefined, { weekday: "short" }),
      value: d.count,
    })),
  [summary]);

  // Event breakdown for bar chart
  const eventBreakdown = useMemo(() =>
    (summary?.byEvent ?? []).map(e => ({
      label: e._id.replace(/_/g, " "),
      value: e.count,
    })).sort((a, b) => b.value - a.value),
  [summary]);

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Admin"
          title="Platform Analytics"
          subtitle="Signal collection across product journeys, conversion funnels, and system health."
          imageUrl="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        <Section padding="small" className="pb-32">
          <Container>

            {/* Time range selector */}
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <span className="dome-kicker">Platform Intelligence</span>
                <select value={days} onChange={e => setDays(Number(e.target.value))}
                  className="dome-input w-40">
                  <option value={7}>Last 7 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
            </Reveal>

            {/* System health row */}
            <Reveal>
              <div className="mb-6">
                <span className="dome-kicker mb-4">System Health</span>
                <Grid cols={4} gap="default">
                  <StatCard label="Total Users"          value={overview?.totalUsers ?? 0}          loading={isLoading} />
                  <StatCard label="Active Consultations" value={overview?.activeConsultations ?? 0}  loading={isLoading} />
                  <StatCard label="Verified Architects"  value={overview?.verifiedArchitects ?? 0}   loading={isLoading} />
                  <StatCard label="Pending Verifications" value={overview?.pendingArchitects ?? 0}   loading={isLoading} accent={overview?.pendingArchitects ? "amber" : undefined} />
                </Grid>
              </div>
            </Reveal>

            {/* Conversion funnel */}
            <Reveal delay={0.05}>
              <div className="mb-6">
                <span className="dome-kicker mb-4">Conversion Funnel</span>
                <Grid cols={4} gap="default">
                  <StatCard label="Profile Views"        value={eventLookup.profile_view ?? 0}       loading={isLoading} />
                  <StatCard label="Consultation Starts"  value={eventLookup.consultation_start ?? 0} loading={isLoading} />
                  <StatCard label="Saves"                value={eventLookup.save ?? 0}               loading={isLoading} />
                  <StatCard label="Conversion Rate"      value={conversionRate} suffix="%" loading={isLoading} />
                </Grid>
              </div>
            </Reveal>

            {/* Trend charts */}
            <Reveal delay={0.1}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="dome-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-display-sm">7-Day Activity</h3>
                    <span className="text-caption text-muted-foreground">{trend7} events</span>
                  </div>
                  {trendData.length > 0 ? (
                    <ChartContainer config={{ value: { label: "Events", color: "hsl(var(--primary))" } }} className="h-48">
                      <AreaChart data={trendData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} />
                      </AreaChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-body-sm">No data yet</div>
                  )}
                </div>

                <div className="dome-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-display-sm">Event Breakdown</h3>
                    <span className="text-caption text-muted-foreground">{trend30} total</span>
                  </div>
                  {eventBreakdown.length > 0 ? (
                    <ChartContainer config={{ value: { label: "Count", color: "hsl(var(--primary))" } }} className="h-48">
                      <BarChart data={eventBreakdown} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="value" fill="hsl(var(--primary))" fillOpacity={0.7} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-body-sm">No data yet</div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* Raw event log */}
            <Reveal delay={0.15}>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="dome-kicker">Event Log</span>
                  <span className="text-caption text-muted-foreground">{events.length} events</span>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                  </div>
                ) : events.length === 0 ? (
                  <div className="dome-panel p-8 text-center text-muted-foreground text-body-sm">No events recorded yet.</div>
                ) : (
                  <div className="space-y-0">
                    <div className="grid grid-cols-3 text-caption text-muted-foreground pb-3 border-b border-border/40">
                      <span>Event</span>
                      <span>Metadata</span>
                      <span>Time</span>
                    </div>
                    <StaggerContainer className="space-y-0">
                      {events.slice(0, 50).map((event, i) => (
                        <StaggerItem key={`${event.event}-${i}`}>
                          <div className="grid grid-cols-3 gap-4 text-body-sm border-b border-border/20 py-3">
                            <span className="text-foreground capitalize font-medium">{event.event.replace(/_/g, " ")}</span>
                            <span className="text-muted-foreground truncate">
                              {event.metadata ? JSON.stringify(event.metadata).slice(0, 60) : "—"}
                            </span>
                            <span className="text-muted-foreground">{new Date(event.createdAt).toLocaleString()}</span>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>
                  </div>
                )}
              </div>
            </Reveal>

          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

const StatCard = ({
  label, value, loading, suffix = "", accent,
}: {
  label: string; value: number; loading: boolean; suffix?: string; accent?: "amber";
}) => (
  <div className={`dome-card p-6 ${accent === "amber" && value > 0 ? "border-l-2 border-amber-400" : ""}`}>
    <p className="text-caption text-muted-foreground mb-2">{label}</p>
    {loading
      ? <Skeleton className="h-8 w-20" />
      : <p className="text-display-sm">{value.toLocaleString()}{suffix}</p>}
  </div>
);

export default AdminAnalytics;

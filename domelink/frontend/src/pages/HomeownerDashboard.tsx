import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import ArchitectDiscoveryCard from "@/components/discovery/ArchitectDiscoveryCard";
import AvoraProjectCopilot from "@/components/intelligence/AvoraProjectCopilot";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";

const formatINR = (n: number) =>
  n >= 10_000_000 ? `₹${(n / 10_000_000).toFixed(1)}Cr` : `₹${(n / 100_000).toFixed(1)}L`;

const HomeownerDashboard = () => {
  const track = useAnalytics();

  const { data: profile } = useQuery({ queryKey: queryKeys.profile(), queryFn: api.me });
  const { data: analyticsSummary = { totals: 0, byEvent: [], daily30: [], daily7: [] } } = useQuery({
    queryKey: ["analytics-summary"], queryFn: api.getAnalyticsSummary,
  });
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery({
    queryKey: queryKeys.consultations(), queryFn: api.getConsultations,
  });
  const { data: savedArchitects = [], isLoading: savedLoading } = useQuery({
    queryKey: queryKeys.savedArchitects(), queryFn: api.getSavedArchitects,
  });
  const { data: recommendationsPayload } = useQuery({
    queryKey: ["recommendations-dashboard"], queryFn: () => api.getHomeownerRecommendations(),
  });
  const { data: avoraEstimates = [] } = useQuery({
    queryKey: ["avora-estimates"], queryFn: api.getAvoraEstimates,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["my-projects"], queryFn: api.getMyProjects,
  });
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"], queryFn: api.getNotifications,
  });
  const { data: payments = [] } = useQuery({
    queryKey: ["payments"], queryFn: api.getPayments,
  });

  const recommendations = recommendationsPayload?.recommendations ?? [];
  const savedIds = useMemo(() => new Set(savedArchitects.map(a => a._id)), [savedArchitects]);
  const activeChats = consultations.filter(c => c.status !== "closed");
  const onboarding = profile?.user;

  const chartData = useMemo(() => {
    if (analyticsSummary.daily7?.length) {
      return analyticsSummary.daily7.map(e => ({
        label: new Date(e._id).toLocaleDateString(undefined, { weekday: "short" }),
        value: e.count,
      }));
    }
    return [
      { label: "Mon", value: 18 }, { label: "Tue", value: 24 },
      { label: "Wed", value: 31 }, { label: "Thu", value: 28 },
      { label: "Fri", value: 36 }, { label: "Sat", value: 30 },
      { label: "Sun", value: 40 },
    ];
  }, [analyticsSummary.daily7]);

  // Build copilot context from real data
  const copilotContext = useMemo(() => {
    const latestProject = projects[0];
    const lastConsultation = consultations[0];
    const daysSinceActivity = lastConsultation
      ? Math.floor((Date.now() - new Date(lastConsultation.createdAt).getTime()) / 86_400_000)
      : 30;
    return {
      projectTitle: latestProject?.title || onboarding?.projectType || "Residential Project",
      status: latestProject?.status || "planning",
      progress: latestProject?.progress ?? 0,
      estimatedBudget: onboarding?.budgetMax ?? undefined,
      estimatedTime: onboarding?.timeline ?? undefined,
      milestones: latestProject?.milestones?.map(m => ({ title: m.title, status: m.status, dueDate: m.dueDate ?? undefined })) ?? [],
      consultationCount: consultations.length,
      lastActivityDaysAgo: daysSinceActivity,
      architectureStyle: Array.isArray(onboarding?.preferredStyles) ? (onboarding.preferredStyles as string[])[0] : undefined,
      complexity: avoraEstimates[0]?.report?.complexityScore ?? 5,
    };
  }, [projects, consultations, onboarding, avoraEstimates]);

  const personalSummary = useMemo(() => [
    { label: "Location",     value: onboarding?.city || "Not set",       note: `Architects popular in ${onboarding?.city || "your city"}` },
    { label: "Project Type", value: onboarding?.projectType || "Not set", note: "Matched to your project category" },
    {
      label: "Style Profile",
      value: Array.isArray(onboarding?.preferredStyles) && onboarding.preferredStyles.length
        ? `${onboarding.preferredStyles.length} preference${onboarding.preferredStyles.length > 1 ? "s" : ""}`
        : "Not set yet",
      note: "Modern Minimal, Contemporary Indian, and more",
    },
  ], [onboarding]);

  // Consolidated activity feed - add unique IDs to each item
  const activityFeed = useMemo(() => {
    const items = [
      ...notifications.slice(0, 3).map((n, idx) => ({
        id: `notification-${(n as any).id || idx}`,
        type: "notification" as const,
        label: n.title || "Notification",
        sub: n.body,
        time: n.createdAt,
      })),
      ...payments.slice(0, 2).map((p, idx) => ({
        id: `payment-${p.id || idx}`,
        type: "payment" as const,
        label: `Payment ₹${p.amount?.toLocaleString("en-IN")}`,
        sub: p.status,
        time: p.createdAt,
      })),
    ];
    return items
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [notifications, payments]);

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Welcome back"
          title={profile?.user?.name || "Homeowner"}
          subtitle={onboarding?.city
            ? `A tailored view for your ${onboarding.city} project.`
            : "Review your saved architects, active conversations, and ongoing projects."}
          imageUrl="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        {/* ── Intelligence layer ─────────────────────────────── */}
        <Section padding="small">
          <Container>

            {/* Email verification nudge — informational only, does not gate anything */}
            <EmailVerificationBanner user={profile?.user as any} />

            {/* Project summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {personalSummary.map(item => (
                <div key={item.label} className="dome-card p-6">
                  <div className="text-caption text-muted-foreground">{item.label}</div>
                  <div className="text-xl font-medium mt-2">{item.value}</div>
                  <p className="text-body-sm text-muted-foreground mt-2">{item.note}</p>
                </div>
              ))}
            </div>

            {/* Avora Copilot — project health */}
            <div className="mb-6">
              <AvoraProjectCopilot context={copilotContext} />
            </div>

            {/* Avora Estimates */}
            <Reveal>
              <div className="dome-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="dome-chip mb-2 inline-block">Avora Intelligence</span>
                    <h3 className="text-display-sm">Feasibility Reports</h3>
                  </div>
                  <Link to="/homeowner/avora-estimate" className="dome-button px-4 py-2 text-xs">
                    New Estimate
                  </Link>
                </div>
                {avoraEstimates.length === 0 ? (
                  <div className="dome-panel p-8 text-center">
                    <p className="text-body text-muted-foreground mb-3">No estimates yet</p>
                    <p className="text-body-sm text-muted-foreground mb-4">
                      Run an Avora estimate to get AI-powered cost ranges, complexity scores, and architect recommendations.
                    </p>
                    <Link to="/homeowner/avora-estimate">
                      <motion.button className="dome-button px-6 py-2" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Start Avora Estimate
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {avoraEstimates.slice(0, 3).map(est => {
                      const r = est.report;
                      return (
                        <div key={est.id} className="dome-panel p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-body-sm font-medium">{est.city} · {est.plotSize?.toLocaleString()} sq ft · {est.floors}F</p>
                            <p className="text-caption text-muted-foreground mt-1">{est.architectureStyle || "Modern"} · {est.interiorTier || "Premium"}</p>
                            {r && <p className="text-body-sm text-muted-foreground mt-1">{formatINR(r.costRange.min)} — {formatINR(r.costRange.max)} · {r.estimatedTimeline}</p>}
                          </div>
                          <div className="text-right flex-shrink-0">
                            {r && <span className="dome-chip">{r.budgetFeasibility}</span>}
                            <p className="text-caption text-muted-foreground mt-2">{new Date(est.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </Reveal>

            {/* Activity Pulse chart */}
            <Reveal delay={0.1}>
              <div className="dome-card p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Activity Pulse</h3>
                  <span className="text-caption text-muted-foreground">Last 7 days</span>
                </div>
                <ChartContainer config={{ value: { label: "Engagement", color: "hsl(var(--primary))" } }} className="h-48">
                  <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} />
                  </AreaChart>
                </ChartContainer>
              </div>
            </Reveal>

            {/* Activity feed */}
            {activityFeed.length > 0 && (
              <Reveal delay={0.15}>
                <div className="dome-card p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="dome-kicker">Recent Activity</span>
                    <span className="text-caption text-muted-foreground">Last 5 items</span>
                  </div>
                  <div className="space-y-3">
                    {activityFeed.map((item) => (
                      <motion.div key={item.id} className="dome-panel p-3 flex items-start justify-between gap-4"
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                        <div className="flex items-start gap-3">
                          <span className="dome-chip text-xs mt-0.5">{item.type}</span>
                          <div>
                            <p className="text-body-sm font-medium">{item.label}</p>
                            {item.sub && <p className="text-caption text-muted-foreground mt-0.5">{item.sub}</p>}
                          </div>
                        </div>
                        <span className="text-caption text-muted-foreground whitespace-nowrap">
                          {new Date(item.time).toLocaleDateString()}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Reveal>
            )}

          </Container>
        </Section>

        {/* ── Active Conversations ───────────────────────────── */}
        <Section padding="small">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-display-sm">Active Conversations</h2>
                <div className="flex gap-4">
                  <Link to="/homeowner/messages" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">Open messages</Link>
                  <Link to="/homeowner/consultations" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">View history</Link>
                  <Link to="/explore" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">Find architects</Link>
                </div>
              </div>
            </Reveal>
            {consultationsLoading ? (
              <div className="space-y-4">
                {[1, 2].map(i => (
                  <div key={`consultation-skeleton-${i}`} className="dome-card p-6 flex items-center gap-6">
                    <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activeChats.length > 0 ? (
              <StaggerContainer className="space-y-4">
                {activeChats.map(chat => (
                  <StaggerItem key={chat._id || (chat as any).id}>
                    <Link to={`/architect/${(chat as any).architect?.slug || (chat as any).architectId}`}>
                      <div className="dome-card p-6 hover:border-foreground transition-colors duration-300 flex items-center gap-6">
                        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80"
                          alt={(chat as any).architect?.name || "Architect"} className="w-16 h-16 rounded-full object-cover" />
                        <div className="flex-1">
                          <h3 className="text-body font-medium">{(chat as any).architect?.name || "Architect"}</h3>
                          <p className="text-body-sm text-muted-foreground">{chat.message}</p>
                        </div>
                        <span className="text-caption text-muted-foreground">{new Date(chat.createdAt).toLocaleDateString()}</span>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            ) : (
              <Reveal>
                <div className="dome-panel p-12 text-center">
                  <p className="text-body text-muted-foreground mb-4">No active conversations</p>
                  <Link to="/explore" className="text-caption link-underline">Find an architect</Link>
                </div>
              </Reveal>
            )}
          </Container>
        </Section>

        {/* ── Saved Architects ───────────────────────────────── */}
        <Section padding="small" className="pb-16">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-display-sm">Saved Architects</h2>
                <div className="flex gap-4">
                  <Link to="/homeowner/project-brief" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">Project brief</Link>
                  <Link to="/homeowner/saved" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">View all saved</Link>
                </div>
              </div>
            </Reveal>
            <Grid cols={3} gap="default">
              {savedLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <Reveal key={`saved-architect-skeleton-${i}`} delay={i * 0.1}>
                      <div className="dome-card p-4">
                        <Skeleton className="aspect-[4/3] mb-4 rounded-2xl" />
                        <Skeleton className="h-5 w-2/3 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </Reveal>
                  ))
                : savedArchitects.filter(a => a?.slug).map((architect, i) => (
                    <Reveal key={architect._id || `saved-${architect.slug}-${i}`} delay={i * 0.1}>
                      <Link to={`/architect/${architect.slug}`}>
                        <div className="dome-card p-4 group">
                          <div className="image-zoom aspect-[4/3] mb-4 rounded-2xl overflow-hidden">
                            <img src={architect.heroImage} alt={architect.name} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <h3 className="text-body font-medium group-hover:text-muted-foreground transition-colors">{architect.name}</h3>
                          <p className="text-body-sm text-muted-foreground">{architect.specialty}</p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
            </Grid>
          </Container>
        </Section>

        {/* ── Recommendations ────────────────────────────────── */}
        {recommendations.length > 0 && (
          <Section padding="small" className="pb-32">
            <Container>
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-display-sm">Recommended for you</h2>
                  <span className="text-caption text-muted-foreground">Based on your activity</span>
                </div>
              </Reveal>
              <Grid cols={3} gap="default">
                {recommendations.map((architect, i) => {
                  const archId = (architect as any).id || architect._id;
                  return (
                    <Reveal key={`rec-${archId}-${i}`} delay={i * 0.1}>
                      <ArchitectDiscoveryCard architect={architect} saved={savedIds.has(archId)} />
                    </Reveal>
                  );
                })}
              </Grid>
            </Container>
          </Section>
        )}

        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default HomeownerDashboard;

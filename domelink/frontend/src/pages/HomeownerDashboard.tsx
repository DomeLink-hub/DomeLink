import { useMemo } from "react";
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
import ProjectBrief3D from "@/components/3d/ProjectBrief3D";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const HomeownerDashboard = () => {
  const track = useAnalytics();
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: api.me,
  });
  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: api.getNotifications,
  });
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: api.getPayments,
  });
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ["reviews", profile?.user?.id],
    queryFn: () => profile?.user?.id ? api.getReviews(profile.user.id) : Promise.resolve([]),
    enabled: !!profile?.user?.id,
  });
  const { data: supportTickets = [], isLoading: supportLoading } = useQuery({
    queryKey: ["support-tickets"],
    queryFn: api.getSupportTickets,
  });
  const { data: analyticsSummary = { totals: 0, byEvent: [], daily30: [], daily7: [] } } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: api.getAnalyticsSummary,
  });
  const analytics = {
    projects: analyticsSummary.totals ?? 0,
    messages: analyticsSummary.byEvent.find(ev => ev._id === "consultation_start")?.count ?? 0,
    reviews: analyticsSummary.byEvent.find(ev => String(ev._id) === "review")?.count ?? 0,
    payments: analyticsSummary.byEvent.find(ev => String(ev._id) === "payment")?.count ?? 0,
    files: analyticsSummary.byEvent.find(ev => String(ev._id) === "file")?.count ?? 0,
    notifications: analyticsSummary.byEvent.find(ev => String(ev._id) === "notification")?.count ?? 0,
  };
  const chartData = useMemo(() => {
    if (analyticsSummary.daily7?.length) {
      return analyticsSummary.daily7.map((entry) => ({
        label: new Date(entry._id).toLocaleDateString(undefined, { weekday: "short" }),
        value: entry.count,
      }));
    }
    return [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 24 },
      { label: "Wed", value: 31 },
      { label: "Thu", value: 28 },
      { label: "Fri", value: 36 },
      { label: "Sat", value: 30 },
      { label: "Sun", value: 40 },
    ];
  }, [analyticsSummary.daily7]);

  const ThreeDWidget = () => (
    <div className="dome-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-display-sm">Interactive 3D Home Model</h3>
        <span className="text-caption text-muted-foreground">Live preview</span>
      </div>
      <ProjectBrief3D plotSize="48x72" style="modern" />
      <p className="mt-4 text-body-sm text-muted-foreground">Rotate to explore massing and spatial intent.</p>
    </div>
  );

  const ChartWidget = () => (
    <div className="dome-card p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-display-sm">Activity Pulse</h3>
        <span className="text-caption text-muted-foreground">Last 7 days</span>
      </div>
      <ChartContainer
        config={{
          value: { label: "Engagement", color: "hsl(var(--primary))" },
        }}
        className="h-56"
      >
        <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
        </AreaChart>
      </ChartContainer>
      <p className="mt-4 text-body-sm text-muted-foreground">Momentum across briefs, chats, and saved architects.</p>
    </div>
  );
  const { data: consultations = [], isLoading: consultationsLoading } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });
  const { data: savedArchitects = [], isLoading: savedLoading } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
  });
  const { data: recommendationsPayload } = useQuery({
    queryKey: ["recommendations-dashboard"],
    queryFn: () => api.getHomeownerRecommendations(),
  });
  const recommendations = recommendationsPayload?.recommendations ?? [];
  const activeChats = consultations.filter((consultation) => consultation.status !== "closed");

  return (
    <PageTransition>
      <Header />
      <main>
        <div>
          <DomeHero
            kicker="Welcome back"
            title={profile?.user?.name || "Homeowner"}
            subtitle="Review your saved architects, active conversations, and ongoing projects."
            imageUrl="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
            align="left"
            className="pt-20"
          />
          {/* --- NEW FEATURE BLOCKS --- */}
          <Section padding="small">
            <Container>
              <div className="dome-card p-6 mb-8">
                <div className="flex items-center justify-between">
                  <span className="dome-chip">AI Insight</span>
                  <span className="text-caption text-muted-foreground">Personalized</span>
                </div>
                <p className="text-body-sm text-muted-foreground mt-4">
                  Based on your activity, Dome AI recommends prioritizing modern studios with courtyard experience.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="dome-chip">Courtyard focus</span>
                  <span className="dome-chip">Budget alignment</span>
                  <span className="dome-chip">Fast response</span>
                </div>
              </div>
              <ThreeDWidget />
              <ChartWidget />
              {/* Notifications */}
              <Reveal>
                <h2 className="text-display-sm mb-8">Notifications</h2>
              </Reveal>
              {notificationsLoading ? (
                <div>Loading notifications...</div>
              ) : notifications.length > 0 ? (
                <Grid cols={2} gap="default">
                  {notifications.map((n) => (
                    <motion.div
                      key={n._id}
                      className="dome-card p-4"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                    >
                      <h3 className="font-semibold">{n.title}</h3>
                      <p>{n.body}</p>
                      <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleDateString()}</span>
                    </motion.div>
                  ))}
                </Grid>
              ) : (
                <div className="dome-panel p-8 text-center">No notifications yet.</div>
              )}
              {/* Payments */}
              <Reveal>
                <h2 className="text-display-sm mb-8">Payments</h2>
              </Reveal>
              {paymentsLoading ? (
                <div>Loading payments...</div>
              ) : payments.length > 0 ? (
                <Grid cols={2} gap="default">
                    {payments.map((p) => (
                      <motion.div
                        key={p._id}
                        className="dome-card p-4"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold">${p.amount}</span>
                          <span className={`dome-chip ${p.status === "completed" ? "bg-green-200" : "bg-yellow-200"}`}>{p.status}</span>
                          <span className="dome-chip">{p.method}</span>
                          <span className="text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleString()}</span>
                        </div>
                      </motion.div>
                    ))}
                </Grid>
              ) : (
                <div className="dome-panel p-8 text-center">No payments found.</div>
              )}
              {/* Reviews */}
              <Reveal>
                <h2 className="text-display-sm mb-8">Reviews</h2>
              </Reveal>
              {reviewsLoading ? (
                <div>Loading reviews...</div>
              ) : reviews.length > 0 ? (
                <Grid cols={2} gap="default">
                  {reviews.map((r, idx) => (
                    <motion.div
                      key={r._id || idx}
                      className="dome-card p-4"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{r.reviewer?.name || r.reviewer || "Anonymous"}</span>
                        <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                      </div>
                      <p>{r.comment}</p>
                    </motion.div>
                  ))}
                </Grid>
              ) : (
                <div className="dome-panel p-8 text-center">No reviews yet.</div>
              )}
              {/* Support Tickets */}
              <Reveal>
                <h2 className="text-display-sm mb-8">Support Tickets</h2>
              </Reveal>
              {supportLoading ? (
                <div>Loading support tickets...</div>
              ) : supportTickets.length > 0 ? (
                <Grid cols={2} gap="default">
                  {supportTickets.map((t) => (
                    <motion.div
                      key={t._id}
                      className="dome-card p-4"
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -6, boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
                    >
                      <span className="font-semibold">{t.subject}</span>
                      <span className={`dome-chip ${t.status === "open" ? "bg-green-200" : "bg-yellow-200"}`}>{t.status}</span>
                      <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</span>
                    </motion.div>
                  ))}
                </Grid>
              ) : (
                <div className="dome-panel p-8 text-center">No support tickets found.</div>
              )}
              {/* Analytics */}
              <Reveal>
                <h2 className="text-display-sm mb-8">Analytics</h2>
              </Reveal>
              <Grid cols={3} gap="default">
                <div className="dome-card p-6"><span className="text-caption">Projects</span><div className="text-2xl font-bold">{analytics.projects ?? 0}</div></div>
                <div className="dome-card p-6"><span className="text-caption">Messages</span><div className="text-2xl font-bold">{analytics.messages ?? 0}</div></div>
                <div className="dome-card p-6"><span className="text-caption">Reviews</span><div className="text-2xl font-bold">{analytics.reviews ?? 0}</div></div>
                <div className="dome-card p-6"><span className="text-caption">Payments</span><div className="text-2xl font-bold">{analytics.payments ?? 0}</div></div>
                <div className="dome-card p-6"><span className="text-caption">Files</span><div className="text-2xl font-bold">{analytics.files ?? 0}</div></div>
                <div className="dome-card p-6"><span className="text-caption">Notifications</span><div className="text-2xl font-bold">{analytics.notifications ?? 0}</div></div>
              </Grid>
            </Container>
          </Section>

          {/* Active Chats */}
          <Section padding="small">
            <Container>
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-display-sm">Active Conversations</h2>
                  <div className="flex gap-4">
                    <Link to="/homeowner/messages" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      Open messages
                    </Link>
                    <Link to="/homeowner/consultations" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      View history
                    </Link>
                    <Link to="/explore" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      Find more architects
                    </Link>
                  </div>
                </div>
              </Reveal>
              {consultationsLoading ? (
                <div className="space-y-4">
                  <DashboardCardSkeleton />
                  <DashboardCardSkeleton />
                </div>
              ) : activeChats.length > 0 ? (
                <StaggerContainer className="space-y-4">
                  {activeChats.map((chat) => (
                    <StaggerItem key={chat._id}>
                      <Link to={`/architect/${chat.architectId.slug}`}>
                        <div className="dome-card p-6 hover:border-foreground transition-colors duration-300 flex items-center gap-6">
                          <img
                            src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&q=80"
                            alt={chat.architectId.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="text-body font-medium">{chat.architectId.name}</h3>
                            <p className="text-body-sm text-muted-foreground">{chat.message}</p>
                          </div>
                          <span className="text-caption text-muted-foreground">
                            {new Date(chat.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <Reveal>
                  <div className="dome-panel p-12 text-center">
                    <p className="text-body text-muted-foreground mb-4">No active conversations</p>
                    <Link to="/explore" className="text-caption link-underline">
                      Find an architect
                    </Link>
                  </div>
                </Reveal>
              )}
            </Container>
          </Section>

          {/* Saved Architects */}
          <Section padding="small" className="pb-32">
            <Container>
              <Reveal>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-display-sm">Saved Architects</h2>
                  <div className="flex gap-4">
                    <Link to="/homeowner/project-brief" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      Project brief
                    </Link>
                    <Link to="/homeowner/saved" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      View all saved
                    </Link>
                    <Link to="/profile/settings" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                      Profile settings
                    </Link>
                  </div>
                </div>
              </Reveal>
              <Grid cols={3} gap="default">
                {savedLoading
                  ? Array.from({ length: 3 }).map((_, index) => (
                      <Reveal key={`saved-skeleton-${index}`} delay={index * 0.1}>
                        <div className="dome-card p-4 group">
                          <Skeleton className="aspect-[4/3] mb-4 rounded-2xl" />
                          <Skeleton className="h-5 w-2/3 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      </Reveal>
                    ))
                  : savedArchitects.filter(a => a && a.slug).map((architect, index) => (
                      <Reveal key={architect._id || index} delay={index * 0.1}>
                        <Link to={`/architect/${architect.slug}`}>
                          <div className="dome-card p-4 group">
                            <div className="image-zoom aspect-[4/3] mb-4 rounded-2xl overflow-hidden">
                              <img
                                src={architect.heroImage}
                                alt={architect.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <h3 className="text-body font-medium group-hover:text-muted-foreground transition-colors">
                              {architect.name}
                            </h3>
                            <p className="text-body-sm text-muted-foreground">{architect.specialty}</p>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
              </Grid>
            </Container>
          </Section>

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
                  {recommendations.map((architect, index) => (
                    <Reveal key={architect._id} delay={index * 0.1}>
                      <Link to={`/architect/${architect.slug}`}>
                        <div
                          className="dome-card p-4 group"
                          onClick={() => track("profile_view", { architectId: architect._id })}
                        >
                          <div className="image-zoom aspect-[4/3] mb-4 rounded-2xl overflow-hidden">
                            <img
                              src={architect.heroImage}
                              alt={architect.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <h3 className="text-body font-medium group-hover:text-muted-foreground transition-colors">
                            {architect.name}
                          </h3>
                          <p className="text-body-sm text-muted-foreground">{architect.specialty}</p>
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </Grid>
              </Container>
            </Section>
          )}
          <DomeCTA />
        </div>
      </main>
      <Footer />
    </PageTransition>
  );
};

const DashboardCardSkeleton = () => (
  <div className="dome-card p-6 flex items-center gap-6">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
    </div>
    <Skeleton className="h-4 w-20" />
  </div>
);

export default HomeownerDashboard;

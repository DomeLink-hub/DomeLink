import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { useNavigate } from "react-router-dom";
import { api, ArchitectStats, Consultation, Notification, Payment, SupportTicket, AnalyticsSummary, Review } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import StudioScene from "@/components/3d/StudioScene";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import ArchitectChatModal from "@/components/chat/ArchitectChatModal";

const ArchitectDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, error: profileError } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: api.me,
  });

  // --- NEW FEATURE BLOCKS ---
  // Notifications Section
  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsError } = useQuery<Notification[]>({
    queryKey: queryKeys.notifications(),
    queryFn: api.getNotifications,
  });

  // Payments Section
  const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useQuery<Payment[]>({
    queryKey: queryKeys.payments(),
    queryFn: api.getPayments,
  });

  // Reviews Section
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useQuery<Review[]>({
    queryKey: queryKeys.reviews(),
    queryFn: () => api.getReviews(profile?.user.id),
    enabled: !!profile?.user.id,
  });

  // Support Tickets Section
  const { data: supportTickets = [], isLoading: supportLoading, error: supportError } = useQuery<SupportTicket[]>({
    queryKey: queryKeys.supportTickets(),
    queryFn: api.getSupportTickets,
  });

  // Analytics Section (for charts)
  const { data: analytics, error: analyticsError } = useQuery<AnalyticsSummary>({
    queryKey: queryKeys.analytics(),
    queryFn: api.getAnalyticsSummary,
  });

  // Helper to get analytics values safely
  const getAnalyticsValue = (key: string) => {
    if (!analytics || !analytics.totals) return 0;
    // If your backend returns a flat object, adjust here
    // If using byEvent, map keys accordingly
    if (analytics.byEvent && Array.isArray(analytics.byEvent)) {
      const found = analytics.byEvent.find((e) => e._id === key);
      return found ? found.count : 0;
    }
    return 0;
  };

  const chartData = useMemo(() => {
    const daily = analytics?.daily7?.length
      ? analytics.daily7.map((entry) => ({
          label: new Date(entry._id).toLocaleDateString(undefined, { weekday: "short" }),
          value: entry.count,
        }))
      : [
          { label: "Mon", value: 6 },
          { label: "Tue", value: 10 },
          { label: "Wed", value: 14 },
          { label: "Thu", value: 9 },
          { label: "Fri", value: 16 },
          { label: "Sat", value: 12 },
          { label: "Sun", value: 18 },
        ];
    return daily;
  }, [analytics?.daily7]);

  const { data: stats } = useQuery<ArchitectStats>({
    queryKey: queryKeys.architectStats(),
    queryFn: api.getMyArchitectStats,
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });

  const pendingRequests = Array.isArray(consultations) ? consultations.filter((consultation) => consultation.status === "pending") : [];
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const updateStatusMutation = useMutation({
    mutationFn: ({ consultationId, status }: { consultationId: string; status: "accepted" | "rejected" }) =>
      api.updateConsultationStatus(consultationId, status),
    onSuccess: async (_, variables) => {
      toast.success(`Request ${variables.status}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.consultations() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.architectStats() }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Unable to update request status.");
    },
  });

  const handleLogout = async () => {
    api.clearToken();
    navigate("/login?role=architect", { replace: true });
  };

  return (
    <PageTransition>
      <Header />
      <main>
        {profileError && <div className="dome-panel p-8 text-center text-red-600">Profile Error: {profileError.message || JSON.stringify(profileError)}</div>}
        <DomeHero
          kicker="Architect Dashboard"
          title={profile?.user.name || "Architect"}
          subtitle="Track your profile views, project inquiries, and earnings in one refined space."
          imageUrl="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80"
          align="left"
          className="pt-20"
        />

        {/* --- NEW FEATURE BLOCKS --- */}
        <Section padding="small">
          <Container>
            <div className="dome-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <span className="dome-chip">AI Studio Insight</span>
                <span className="text-caption text-muted-foreground">Auto-synthesized</span>
              </div>
              <p className="text-body-sm text-muted-foreground mt-4">
                Based on recent inquiries, clients are leaning toward modern timber palettes and faster concept delivery.
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="dome-chip">Timber + stone</span>
                <span className="dome-chip">Concept sprint</span>
                <span className="dome-chip">High intent</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Studio 3D Preview</h3>
                  <span className="text-caption text-muted-foreground">Interactive</span>
                </div>
                <StudioScene className="h-72 w-full" />
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Active briefs</p>
                    <p className="text-display-sm mt-2">{stats?.pendingRequests ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Monthly earnings</p>
                    <p className="text-display-sm mt-2">${(stats?.monthlyEarnings ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Earnings & Activity</h3>
                  <span className="text-caption text-muted-foreground">7-day trend</span>
                </div>
                <ChartContainer
                  config={{
                    value: { label: "Activity", color: "hsl(var(--primary))" },
                  }}
                  className="h-64"
                >
                  <AreaChart data={chartData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.2} />
                  </AreaChart>
                </ChartContainer>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Profile views</p>
                    <p className="text-display-sm mt-2">{stats?.profileViews ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Total earnings</p>
                    <p className="text-display-sm mt-2">${(stats?.totalEarnings ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </Section>

        {/* Notifications */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Notifications</h2>
            </Reveal>
            {notificationsError && <div className="dome-panel p-8 text-center text-red-600">Notifications Error: {notificationsError.message || JSON.stringify(notificationsError)}</div>}
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
                    <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</span>
                  </motion.div>
                ))}
              </Grid>
            ) : (
              <div className="dome-panel p-8 text-center">No notifications yet.</div>
            )}
          </Container>
        </Section>

        {/* Payments */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Payments</h2>
            </Reveal>
            {paymentsError && <div className="dome-panel p-8 text-center text-red-600">Payments Error: {paymentsError.message || JSON.stringify(paymentsError)}</div>}
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
          </Container>
        </Section>

        {/* Reviews */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Reviews</h2>
            </Reveal>
            {reviewsError && <div className="dome-panel p-8 text-center text-red-600">Reviews Error: {reviewsError.message || JSON.stringify(reviewsError)}</div>}
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
                      <span className="font-semibold">
                        {(typeof r.reviewer === "object" ? r.reviewer?.name : r.reviewer) || "Anonymous"}
                      </span>
                      <span className="text-yellow-500">{"★".repeat(r.rating)}</span>
                    </div>
                    <p>{r.comment}</p>
                  </motion.div>
                ))}
              </Grid>
            ) : (
              <div className="dome-panel p-8 text-center">No reviews yet.</div>
            )}
          </Container>
        </Section>

        {/* Support Tickets */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Support Tickets</h2>
            </Reveal>
            {supportError && <div className="dome-panel p-8 text-center text-red-600">Support Error: {supportError.message || JSON.stringify(supportError)}</div>}
            {supportLoading ? (
              <div>Loading support tickets...</div>
            ) : supportTickets.length > 0 ? (
              <Grid cols={2} gap="default">
                {supportTickets.map((t) => (
                  <div key={t._id} className="dome-card p-4">
                    <span className="font-semibold">{t.subject}</span>
                    <span className={`dome-chip ${t.status === "open" ? "bg-green-200" : "bg-yellow-200"}`}>{t.status}</span>
                    <span className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </Grid>
            ) : (
              <div className="dome-panel p-8 text-center">No support tickets found.</div>
            )}
          </Container>
        </Section>

        {/* Analytics */}
        <Section padding="small">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Analytics</h2>
            </Reveal>
            {analyticsError && <div className="dome-panel p-8 text-center text-red-600">Analytics Error: {analyticsError.message || JSON.stringify(analyticsError)}</div>}
            <Grid cols={3} gap="default">
              <div className="dome-card p-6"><span className="text-caption">Projects</span><div className="text-2xl font-bold">{getAnalyticsValue("projects")}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Messages</span><div className="text-2xl font-bold">{getAnalyticsValue("messages")}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Reviews</span><div className="text-2xl font-bold">{getAnalyticsValue("reviews")}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Payments</span><div className="text-2xl font-bold">{getAnalyticsValue("payments")}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Files</span><div className="text-2xl font-bold">{getAnalyticsValue("files")}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Notifications</span><div className="text-2xl font-bold">{getAnalyticsValue("notifications")}</div></div>
            </Grid>
          </Container>
        </Section>

        {/* --- END NEW FEATURE BLOCKS --- */}

        {/* Stats */}
        <Section padding="small">
          <Container>
            <Grid cols={4} gap="default">
              <Reveal>
                <div className="dome-card p-6">
                  <span className="text-caption text-muted-foreground block mb-2">Profile Views</span>
                  <span className="text-display-md">{(stats?.profileViews ?? 0).toLocaleString()}</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="dome-card p-6">
                  <span className="text-caption text-muted-foreground block mb-2">This Month</span>
                  <span className="text-display-md">{stats?.thisMonthRequests ?? 0}</span>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="dome-card p-6">
                  <span className="text-caption text-muted-foreground block mb-2">Chat Requests</span>
                  <span className="text-display-md">{stats?.totalRequests ?? consultations.length}</span>
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="dome-card p-6">
                  <span className="text-caption text-muted-foreground block mb-2">Earnings (Month)</span>
                  <span className="text-display-md">${(stats?.monthlyEarnings ?? 0).toLocaleString()}</span>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>
        {/* Incoming & Active Requests */}
        <Section padding="small">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-display-sm">Consultation Requests</h2>
              </div>
            </Reveal>
            <StaggerContainer className="space-y-4">
              {/* NOTE: Make sure this array includes 'accepted' requests too! */}
              {consultations.map((request) => (
                <StaggerItem key={request._id}>
                  <div className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-body font-medium mb-1">{request.userId.name}</h3>
                        <p className="text-body-sm text-muted-foreground">{request.message}</p>
                      </div>
                      <span className="text-caption text-muted-foreground uppercase">
                        {request.status} • {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Budget: ${request.amount}</span>
                      
                      <div className="flex gap-3">
                        {/* 🔴 THE STATUS CHECK MAGIC */}
                        {request.status === "pending" ? (
                          <>
                            <motion.button
                              className="dome-button-outline"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateStatusMutation.mutate({ consultationId: request._id, status: "rejected" })}
                              disabled={updateStatusMutation.isPending}
                            >
                              Reject
                            </motion.button>
                            <motion.button
                              className="dome-button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => updateStatusMutation.mutate({ consultationId: request._id, status: "accepted" })}
                              disabled={updateStatusMutation.isPending}
                            >
                              Accept
                            </motion.button>
                          </>
                        ) : (
                          // If it's accepted or active, show the message button!
                          <motion.button
                            className="dome-button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedConsultation(request)}
                          >
                            Message Client
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>
        {/* Earnings Summary */}
        <Section padding="small" className="pb-32">
          <Container>
            <Reveal>
              <h2 className="text-display-sm mb-8">Earnings Summary</h2>
            </Reveal>
            <Grid cols={3} gap="default">
              <Reveal>
                <div className="dome-card p-8 text-center">
                  <span className="text-caption text-muted-foreground block mb-2">This Month</span>
                  <span className="text-display-lg">${(stats?.monthlyEarnings ?? 0).toLocaleString()}</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div className="dome-card p-8 text-center">
                  <span className="text-caption text-muted-foreground block mb-2">Pending</span>
                  <span className="text-display-lg">{stats?.pendingRequests ?? 0}</span>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="dome-card p-8 text-center">
                  <span className="text-caption text-muted-foreground block mb-2">Total Earnings</span>
                  <span className="text-display-lg">${(stats?.totalEarnings ?? profile?.earnings ?? 0).toLocaleString()}</span>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>
        {/* Quick Links */}
        <Section padding="small" className="bg-secondary/20">
          <Container>
            <Grid cols={3} gap="default">
              <Reveal>
                <Link to="/architect/portfolio">
                  <motion.div
                    className="dome-card p-8 hover:border-foreground transition-colors duration-300 text-center"
                    whileHover={{ y: -4 }}
                  >
                    <h3 className="text-display-sm mb-2">Portfolio</h3>
                    <p className="text-body-sm text-muted-foreground">Manage your projects</p>
                  </motion.div>
                </Link>
              </Reveal>
              <Reveal delay={0.1}>
                <Link to="/architect/team">
                  <motion.div
                    className="dome-card p-8 hover:border-foreground transition-colors duration-300 text-center"
                    whileHover={{ y: -4 }}
                  >
                    <h3 className="text-display-sm mb-2">Team</h3>
                    <p className="text-body-sm text-muted-foreground">Collaborate with others</p>
                  </motion.div>
                </Link>
              </Reveal>
              <Reveal delay={0.2}>
                <Link to="/architect/elena-vasquez">
                  <motion.div
                    className="dome-card p-8 hover:border-foreground transition-colors duration-300 text-center"
                    whileHover={{ y: -4 }}
                  >
                    <h3 className="text-display-sm mb-2">Public Profile</h3>
                    <p className="text-body-sm text-muted-foreground">See how clients view you</p>
                  </motion.div>
                </Link>
              </Reveal>
            </Grid>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
      <ArchitectChatModal 
            isOpen={!!selectedConsultation} 
            onClose={() => setSelectedConsultation(null)} 
            consultation={selectedConsultation} 
          />
    </PageTransition>
  );
};

export default ArchitectDashboard;

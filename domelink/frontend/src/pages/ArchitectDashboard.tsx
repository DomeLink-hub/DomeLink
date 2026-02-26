import { Link } from "react-router-dom";
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
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";

const ArchitectDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, error: profileError } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: api.me,
  });

  // --- NEW FEATURE BLOCKS ---
  // Notifications Section
  const { data: notifications = [], isLoading: notificationsLoading, error: notificationsError } = useQuery({
    queryKey: queryKeys.notifications(),
    queryFn: api.getNotifications,
  });

  // Payments Section
  const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: queryKeys.payments(),
    queryFn: api.getPayments,
  });

  // Reviews Section
  const { data: reviews = [], isLoading: reviewsLoading, error: reviewsError } = useQuery({
    queryKey: queryKeys.reviews(),
    queryFn: () => api.getReviews(profile?.user.id),
    enabled: !!profile?.user.id,
  });

  // Support Tickets Section
  const { data: supportTickets = [], isLoading: supportLoading, error: supportError } = useQuery({
    queryKey: queryKeys.supportTickets(),
    queryFn: api.getSupportTickets,
  });

  // Analytics Section (for charts)
  const { data: analytics = {}, error: analyticsError } = useQuery({
    queryKey: queryKeys.analytics(),
    queryFn: api.getAnalyticsSummary,
  });

  // 3D Animation Placeholder
  // (Would use @react-three/fiber, but here is a placeholder component)
  const ThreeDWidget = () => (
    <div className="dome-card p-8 mb-8 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-100 to-pink-100">
      <div className="w-64 h-64 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-400 to-purple-400 animate-spin-slow shadow-xl flex items-center justify-center">
        <span className="text-6xl">🏗️</span>
      </div>
      <p className="mt-4 text-lg font-bold text-pink-700">Interactive 3D Project Model</p>
      <p className="text-muted-foreground">Showcase your architectural projects in 3D!</p>
    </div>
  );

  // Chart Placeholder (Would use chart.js or similar)
  const ChartWidget = () => (
    <div className="dome-card p-8 mb-8">
      <h3 className="text-display-sm mb-4">Earnings & Activity Chart</h3>
      <div className="w-full h-64 bg-gradient-to-r from-yellow-100 to-pink-100 rounded-xl flex items-center justify-center">
        <span className="text-4xl text-yellow-700">📊</span>
      </div>
      <p className="mt-4 text-muted-foreground">Your earnings and activity trends visualized.</p>
    </div>
  );

  const { data: stats } = useQuery({
    queryKey: queryKeys.architectStats(),
    queryFn: api.getMyArchitectStats,
    error: statsError
  });

  const { data: consultations = [] } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
    error: consultationsError
  });

  const pendingRequests = consultations.filter((consultation) => consultation.status === "pending");

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
            <ThreeDWidget />
            <ChartWidget />
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
              <div className="dome-card p-6"><span className="text-caption">Projects</span><div className="text-2xl font-bold">{analytics.projects ?? 0}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Messages</span><div className="text-2xl font-bold">{analytics.messages ?? 0}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Reviews</span><div className="text-2xl font-bold">{analytics.reviews ?? 0}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Payments</span><div className="text-2xl font-bold">{analytics.payments ?? 0}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Files</span><div className="text-2xl font-bold">{analytics.files ?? 0}</div></div>
              <div className="dome-card p-6"><span className="text-caption">Notifications</span><div className="text-2xl font-bold">{analytics.notifications ?? 0}</div></div>
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
        {/* Incoming Requests */}
        <Section padding="small">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-display-sm">Incoming Requests</h2>
                <span className="text-caption text-muted-foreground">
                  {pendingRequests.length} pending
                </span>
              </div>
            </Reveal>
            <StaggerContainer className="space-y-4">
              {pendingRequests.map((request) => (
                <StaggerItem key={request._id}>
                  <div className="dome-card p-6 hover:border-foreground transition-colors duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-body font-medium mb-1">{request.userId.name}</h3>
                        <p className="text-body-sm text-muted-foreground">{request.message}</p>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-body-sm text-muted-foreground">Budget: ${request.amount}</span>
                      <div className="flex gap-3">
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
    </PageTransition>
  );
};

export default ArchitectDashboard;

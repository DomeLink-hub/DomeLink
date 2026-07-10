import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import { motion } from "framer-motion";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { useNavigate } from "react-router-dom";
import { api, ArchitectStats, ClientLead, Consultation, Notification, Payment, SavedByClient, SupportTicket, AnalyticsSummary, Review } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import StudioScene from "@/components/3d/StudioScene";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import ArchitectChatModal from "@/components/chat/ArchitectChatModal";
import { BrainCircuit } from "lucide-react";
import AvoraProjectCopilot from "@/components/intelligence/AvoraProjectCopilot";
import EmailVerificationBanner from "@/components/common/EmailVerificationBanner";

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => String(entry).trim().toLowerCase())
      .filter((entry) => entry.length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim().toLowerCase()];
  }
  return [];
};

const formatInr = (value?: number | null) =>
  typeof value === "number"
    ? `₹${value.toLocaleString("en-IN")}`
    : "N/A";

const formatBudgetRange = (min?: number | null, max?: number | null) => {
  if (typeof min === "number" && typeof max === "number") {
    return `${formatInr(min)} – ${formatInr(max)}`;
  }
  if (typeof min === "number") return `${formatInr(min)}+`;
  if (typeof max === "number") return `Up to ${formatInr(max)}`;
  return "Not specified";
};

const getLeadBudgetMin = (lead: ClientLead) => lead.budgetMin ?? 0;
const getLeadBudgetMax = (lead: ClientLead) => lead.budgetMax ?? lead.budgetMin ?? 0;

const getStyleMatchPercent = (architectTags: string[], leadTags: string[]) => {
  if (!architectTags.length || !leadTags.length) return 0;
  const architectSet = new Set(architectTags);
  const overlap = leadTags.filter((tag) => architectSet.has(tag)).length;
  return Math.round((overlap / leadTags.length) * 100);
};

const normalizeConsultationStatus = (status: string) => status.toUpperCase();

const formatConsultationStatus = (status: string) =>
  normalizeConsultationStatus(status).replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

const consultationStatusClass = (status: string) => {
  const normalized = normalizeConsultationStatus(status);
  if (normalized === "PENDING") return "bg-amber-500/15 text-amber-200 border-amber-500/20";
  if (normalized === "ACCEPTED") return "bg-sky-500/15 text-sky-200 border-sky-500/20";
  if (normalized === "IN_PROGRESS") return "bg-blue-500/15 text-blue-200 border-blue-500/20";
  if (normalized === "REVIEW_PENDING") return "bg-violet-500/15 text-violet-200 border-violet-500/20";
  if (normalized === "COMPLETED") return "bg-emerald-500/15 text-emerald-200 border-emerald-500/20";
  if (normalized === "CANCELLED") return "bg-rose-500/15 text-rose-200 border-rose-500/20";
  return "bg-white/10 text-white/80 border-white/15";
};

const ConsultationLeadCard = ({ request, updateStatusMutation, createProjectMutation, setSelectedConsultation }: any) => {
  const [summary, setSummary] = useState<{ summary: string; leadScore: number; nextBestAction: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (summary) return;
    setLoading(true);
    try {
      const res = await api.summarizeConsultation(request);
      setSummary(res);
    } catch {
      toast.error("Failed to generate summary");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dome-card p-6 hover:border-foreground transition-colors duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-body font-medium mb-1">{request.user?.name || "Client"}</h3>
          <p className="text-body-sm text-muted-foreground">{request.message}</p>
        </div>
        <span className="text-caption text-muted-foreground uppercase">
          {formatConsultationStatus(request.status)} • {new Date(request.createdAt).toLocaleDateString()}
        </span>
      </div>
      
      <div className="bg-primary/5 rounded-lg p-3 mb-4 border border-primary/10">
         <div className="flex items-center justify-between cursor-pointer group" onClick={handleSummarize}>
           <div className="flex items-center gap-2 text-primary/80 font-medium text-sm group-hover:text-primary transition-colors">
             <BrainCircuit className="w-4 h-4" /> AI Lead Intelligence
           </div>
           {!summary && !loading && <span className="text-xs text-primary/60 underline group-hover:text-primary transition-colors">Analyze Lead</span>}
           {loading && <span className="text-xs text-primary/80 animate-pulse">Running architectural analysis...</span>}
         </div>
         {summary && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 text-sm text-foreground/90 leading-relaxed border-t border-primary/10 pt-3">
               <div className="flex items-center gap-2 mb-2">
                 <span className="dome-chip bg-primary/10 text-primary border-primary/20">Lead Score {summary.leadScore}/100</span>
               </div>
               <p>{summary.summary}</p>
               <p className="mt-2 text-body-sm text-muted-foreground">Next: {summary.nextBestAction}</p>
            </motion.div>
         )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-body-sm text-muted-foreground">Est. Budget: ${request.amount}</span>
        <div className="flex gap-3">
          {normalizeConsultationStatus(request.status) === "PENDING" ? (
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
          ) : normalizeConsultationStatus(request.status) === "ACCEPTED" ? (
            <div className="flex gap-2">
              <motion.button
                className="dome-button-outline text-xs px-3 py-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateStatusMutation.mutate({ consultationId: request._id, status: "start" })}
                disabled={updateStatusMutation.isPending}
              >
                Start Work
              </motion.button>
              <motion.button
                className="dome-button text-xs px-3 py-1 bg-primary text-primary-foreground"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConsultation(request)}
              >
                Message Client
              </motion.button>
            </div>
          ) : normalizeConsultationStatus(request.status) === "IN_PROGRESS" ? (
            <div className="flex gap-2">
              <motion.button
                className="dome-button-outline text-xs px-3 py-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => updateStatusMutation.mutate({ consultationId: request._id, status: "complete" })}
                disabled={updateStatusMutation.isPending}
              >
                Send for Review
              </motion.button>
              <motion.button
                className="dome-button text-xs px-3 py-1 bg-primary text-primary-foreground"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedConsultation(request)}
              >
                Message Client
              </motion.button>
            </div>
          ) : (
            <div className="flex gap-2">
               <motion.button
                 className="dome-button-outline text-xs px-3 py-1"
                 whileHover={{ scale: 1.02 }}
                 whileTap={{ scale: 0.98 }}
                 onClick={() => setSelectedConsultation(request)}
               >
                 Message Client
               </motion.button>
               {normalizeConsultationStatus(request.status) === "ACCEPTED" && (
                 <motion.button
                   className="dome-button text-xs px-3 py-1 bg-primary text-primary-foreground"
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   onClick={() => createProjectMutation.mutate(request._id)}
                   disabled={createProjectMutation.isPending}
                 >
                   Create Workspace
                 </motion.button>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ArchitectDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [leadCityFilter, setLeadCityFilter] = useState<string>("all");
  const [leadSort, setLeadSort] = useState<"recent" | "budget" | "style">("recent");
  const [budgetFilterMin, setBudgetFilterMin] = useState<number>(0);
  const [budgetFilterMax, setBudgetFilterMax] = useState<number>(0);
  const [budgetBoundsReady, setBudgetBoundsReady] = useState(false);
  const [interestedLeadIds, setInterestedLeadIds] = useState<string[]>([]);
  const [interestInFlightLeadId, setInterestInFlightLeadId] = useState<string | null>(null);

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

  // AI Studio Insight — real aggregation from consultations/leads
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: queryKeys.architectInsights(),
    queryFn: api.getArchitectInsights,
  });

  const { data: consultations = [] } = useQuery<Consultation[]>({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });

  const { data: leads = [], isLoading: leadsLoading } = useQuery<ClientLead[]>({
    queryKey: queryKeys.clientLeads(),
    queryFn: () => api.getClientLeads(),
  });

  const { data: saverClients = [], isLoading: saverClientsLoading } = useQuery<SavedByClient[]>({
    queryKey: queryKeys.mySavers(),
    queryFn: api.getMySavers,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["myProjects"],
    queryFn: api.getMyProjects,
  });

  const pendingRequests = Array.isArray(consultations) ? consultations.filter((consultation) => normalizeConsultationStatus(consultation.status) === "PENDING") : [];
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);

  const architectStyleTags = useMemo(() => {
    const user = profile?.user as unknown as Record<string, unknown> | undefined;
    return normalizeTags(user?.designStyles || user?.preferredStyles);
  }, [profile?.user]);

  const cityOptions = useMemo(() => {
    return Array.from(
      new Set(
        leads
          .map((lead) => (lead.city || "").trim())
          .filter((city) => city.length > 0),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [leads]);

  const budgetBounds = useMemo(() => {
    if (leads.length === 0) return { min: 0, max: 1_000_000 };
    const min = Math.min(...leads.map((lead) => getLeadBudgetMin(lead)));
    const max = Math.max(...leads.map((lead) => getLeadBudgetMax(lead)));
    return {
      min,
      max: Math.max(max, min + 1),
    };
  }, [leads]);

  useEffect(() => {
    if (budgetBoundsReady) return;
    setBudgetFilterMin(budgetBounds.min);
    setBudgetFilterMax(budgetBounds.max);
    setBudgetBoundsReady(true);
  }, [budgetBounds.max, budgetBounds.min, budgetBoundsReady]);

  const processedLeads = useMemo(() => {
    const withMatch = leads.map((lead) => {
      const leadTags = normalizeTags(lead.styleTags);
      return {
        ...lead,
        styleMatchPercent: getStyleMatchPercent(architectStyleTags, leadTags),
      };
    });

    const filtered = withMatch.filter((lead) => {
      if (leadCityFilter !== "all" && lead.city !== leadCityFilter) {
        return false;
      }

      const leadMin = getLeadBudgetMin(lead);
      const leadMax = getLeadBudgetMax(lead);
      return leadMax >= budgetFilterMin && leadMin <= budgetFilterMax;
    });

    return filtered.sort((a, b) => {
      if (leadSort === "budget") {
        return getLeadBudgetMax(b) - getLeadBudgetMax(a);
      }
      if (leadSort === "style") {
        if (b.styleMatchPercent !== a.styleMatchPercent) {
          return b.styleMatchPercent - a.styleMatchPercent;
        }
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [architectStyleTags, budgetFilterMax, budgetFilterMin, leadCityFilter, leadSort, leads]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ consultationId, status }: { consultationId: string; status: "accepted" | "rejected" | "start" | "complete" | "cancel" }) =>
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

  const createProjectMutation = useMutation({
    // progress and status are NOT sent — the Project model has no progress field,
    // and status always starts at "planning" server-side by design.
    mutationFn: (consultationId: string) => api.createProject({ consultationId, title: "New Project Workflow" }),
    onSuccess: (data) => {
      toast.success("Project workspace created!");
      queryClient.invalidateQueries({ queryKey: queryKeys.consultations() });
      navigate(`/architect/project/${data.id}`);
    },
  });

  const expressInterestMutation = useMutation({
    mutationFn: (leadUserId: string) => api.expressInterestInLead(leadUserId),
    onMutate: (leadUserId) => {
      setInterestInFlightLeadId(leadUserId);
    },
    onSuccess: (_, leadUserId) => {
      setInterestedLeadIds((prev) => (prev.includes(leadUserId) ? prev : [...prev, leadUserId]));
      toast.success("Interest sent to homeowner");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not express interest");
    },
    onSettled: () => {
      setInterestInFlightLeadId(null);
    },
  });

  const startSaverConversationMutation = useMutation({
    mutationFn: (userId: string) => api.startConversationWithSaver(userId),
    onSuccess: (consultation) => {
      setSelectedConsultation(consultation);
      toast.success("Conversation ready");
      void queryClient.invalidateQueries({ queryKey: queryKeys.consultations() });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Could not start conversation");
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

        {/* Studio Command */}
        <Section padding="small">
          <Container>
            {/* Email verification nudge — informational only, does not gate anything */}
            <EmailVerificationBanner user={profile?.user as any} />

            {/* Profile Strength */}
            {(() => {
              const p = profile?.user;
              const arch = profile as any;
              const completion = Math.max(0, Math.min(100, Number(p?.profileCompletionPercentage ?? arch?.profileCompletionPercentage ?? 0)));
              const strength = completion || [
                arch?.completedProjects > 0,
                arch?.rating >= 4,
                arch?.isVerified,
                arch?.about,
                arch?.heroImage,
              ].reduce((total, flag) => total + (flag ? 20 : 0), 0);
              return (
                <div className="dome-card p-6 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="dome-kicker">Profile Strength</span>
                    <span className="text-body-sm font-medium">{strength}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-foreground"
                      initial={{ width: 0 }}
                      animate={{ width: `${strength}%` }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                  <p className="text-body-sm text-muted-foreground mt-2">
                    {strength < 60 ? "Complete onboarding fields, add portfolio assets, and verify trust details." : strength < 80 ? "Your studio is looking strong. A few more assets will improve discovery." : "Your profile is highly optimised for discovery."}
                  </p>
                </div>
              );
            })()}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="dome-card p-5">
                <span className="text-caption text-muted-foreground block mb-2">Pending Requests</span>
                <span className="text-display-sm">{stats?.pendingRequests ?? 0}</span>
              </div>
              <div className="dome-card p-5">
                <span className="text-caption text-muted-foreground block mb-2">Active Projects</span>
                <span className="text-display-sm">{projects.length}</span>
              </div>
              <div className="dome-card p-5">
                <span className="text-caption text-muted-foreground block mb-2">Monthly Earnings</span>
                <span className="text-display-sm">₹{(stats?.monthlyEarnings ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="dome-card p-5">
                <span className="text-caption text-muted-foreground block mb-2">Profile Views</span>
                <span className="text-display-sm">{(stats?.profileViews ?? 0).toLocaleString()}</span>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="dome-card p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="dome-kicker">Activity Feed</span>
                <span className="text-caption text-muted-foreground">Last 5 items</span>
              </div>
              <div className="space-y-3">
                {[
                  ...notifications.slice(0, 2).map((n) => ({ type: "notification", label: n.title, sub: n.body, time: n.createdAt })),
                  ...payments.slice(0, 1).map((p) => ({ type: "payment", label: `Payment ₹${p.amount}`, sub: p.status, time: p.createdAt })),
                  ...reviews.slice(0, 1).map((r) => ({ type: "review", label: `Review — ${(r.rating)}/5`, sub: r.comment?.slice(0, 60) || "", time: r.createdAt })),
                  ...supportTickets.slice(0, 1).map((t) => ({ type: "support", label: t.subject, sub: t.status, time: t.createdAt })),
                ]
                  .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                  .slice(0, 5)
                  .map((item, i) => (
                    <motion.div
                      key={i}
                      className="dome-panel p-3 flex items-start justify-between gap-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
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
                {notifications.length === 0 && payments.length === 0 && reviews.length === 0 && (
                  <div className="dome-panel p-6 text-center text-muted-foreground text-body-sm">No recent activity.</div>
                )}
              </div>
            </div>
          </Container>
        </Section>

        {/* --- NEW FEATURE BLOCKS --- */}
        <Section padding="small">
          <Container>
            {/* AI Studio Insight — derived from real consultation/lead data */}
            <div className="dome-card p-6 mb-8">
              <div className="flex items-center justify-between">
                <span className="dome-chip">AI Studio Insight</span>
                <span className="text-caption text-muted-foreground">Auto-synthesized</span>
              </div>
              {insightsLoading ? (
                <div className="mt-4 space-y-2">
                  <div className="h-3 w-3/4 rounded-full bg-border/60 animate-pulse" />
                  <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-6 w-20 rounded-full bg-border/40 animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : !insights || !insights.hasEnoughData ? (
                <p className="text-body-sm text-muted-foreground mt-4">
                  {insights ? (insights as any).reason : "Insights will appear once you have a few consultations."}
                </p>
              ) : (
                <>
                  <p className="text-body-sm text-muted-foreground mt-4">
                    {insights.summary}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {insights.tags.map((tag) => (
                      <span key={tag} className="dome-chip">{tag}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Studio 3D Preview</h3>
                  <span className="text-caption text-muted-foreground">Interactive</span>
                </div>
                <div className="h-72 w-full">
                  <StudioScene />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Active briefs</p>
                    <p className="text-display-sm mt-2">{stats?.pendingRequests ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Monthly earnings</p>
                    <p className="text-display-sm mt-2">₹{(stats?.monthlyEarnings ?? 0).toLocaleString()}</p>
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
                    <p className="text-display-sm mt-2">₹{(stats?.totalEarnings ?? 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
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
                  <span className="text-display-md">₹{(stats?.monthlyEarnings ?? 0).toLocaleString()}</span>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>

        {/* Client Leads */}
        <Section padding="small">
          <Container>
            <details className="dome-card p-6" open>
              <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="dome-kicker">Client Leads</span>
                  <h2 className="text-display-sm mt-2">Homeowner Onboarding + Avora Signals</h2>
                </div>
                <span className="dome-chip">{processedLeads.length} leads</span>
              </summary>

              <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="dome-panel p-4">
                  <label className="text-caption text-muted-foreground block mb-2">City</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm"
                    value={leadCityFilter}
                    onChange={(event) => setLeadCityFilter(event.target.value)}
                  >
                    <option value="all">All cities</option>
                    {cityOptions.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="dome-panel p-4 lg:col-span-2">
                  <label className="text-caption text-muted-foreground block mb-2">Budget range</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="range"
                        min={budgetBounds.min}
                        max={budgetBounds.max}
                        value={budgetFilterMin}
                        onChange={(event) => {
                          const nextMin = Math.min(Number(event.target.value), budgetFilterMax);
                          setBudgetFilterMin(nextMin);
                        }}
                        className="w-full"
                      />
                      <p className="text-caption text-muted-foreground mt-1">Min: {formatInr(budgetFilterMin)}</p>
                    </div>
                    <div>
                      <input
                        type="range"
                        min={budgetBounds.min}
                        max={budgetBounds.max}
                        value={budgetFilterMax}
                        onChange={(event) => {
                          const nextMax = Math.max(Number(event.target.value), budgetFilterMin);
                          setBudgetFilterMax(nextMax);
                        }}
                        className="w-full"
                      />
                      <p className="text-caption text-muted-foreground mt-1">Max: {formatInr(budgetFilterMax)}</p>
                    </div>
                  </div>
                </div>

                <div className="dome-panel p-4">
                  <label className="text-caption text-muted-foreground block mb-2">Sort by</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-body-sm"
                    value={leadSort}
                    onChange={(event) => setLeadSort(event.target.value as "recent" | "budget" | "style")}
                  >
                    <option value="recent">Recency</option>
                    <option value="budget">Budget (high to low)</option>
                    <option value="style">Style match %</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {leadsLoading && (
                  <div className="dome-panel p-5 text-body-sm text-muted-foreground">Loading client leads...</div>
                )}

                {!leadsLoading && processedLeads.length === 0 && (
                  <div className="dome-panel p-5 text-body-sm text-muted-foreground">
                    No leads match your current filters.
                  </div>
                )}

                {processedLeads.map((lead) => {
                  const isInterested = interestedLeadIds.includes(lead.id);
                  const isSubmitting = interestInFlightLeadId === lead.id;

                  return (
                    <div key={lead.id} className="dome-panel p-5 border border-border/60">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h3 className="text-body font-medium">{lead.city || "Unknown City"}</h3>
                          <p className="text-body-sm text-muted-foreground">{lead.projectType || "Project type not specified"}</p>
                        </div>
                        {typeof lead.avoraScore === "number" && (
                          <span className="dome-chip">Avora {lead.avoraScore}</span>
                        )}
                      </div>

                      <div className="space-y-1 text-body-sm">
                        <p><span className="text-muted-foreground">Budget:</span> {formatBudgetRange(lead.budgetMin, lead.budgetMax)}</p>
                        <p><span className="text-muted-foreground">Plot size:</span> {lead.plotSize ? `${lead.plotSize.toLocaleString("en-IN")} sq ft` : "N/A"}</p>
                        <p><span className="text-muted-foreground">Family size:</span> {lead.familySize ?? "N/A"}</p>
                        <p><span className="text-muted-foreground">Timeline:</span> {lead.timeline || "N/A"}</p>
                        <p><span className="text-muted-foreground">Style match:</span> {lead.styleMatchPercent}%</p>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {lead.styleTags.length > 0 ? (
                          lead.styleTags.map((tag) => (
                            <span key={`${lead.id}-${tag}`} className="dome-chip bg-primary/10 border-primary/20 text-primary">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-caption text-muted-foreground">No style tags</span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-caption text-muted-foreground">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                        <motion.button
                          className="dome-button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => expressInterestMutation.mutate(lead.id)}
                          disabled={isInterested || isSubmitting}
                        >
                          {isInterested ? "Interest Sent" : isSubmitting ? "Sending..." : "Express Interest"}
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </details>
          </Container>
        </Section>

        {/* Interested Clients */}
        <Section padding="small">
          <Container>
            <details className="dome-card p-6" open>
              <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="dome-kicker">Interested Clients</span>
                  <h2 className="text-display-sm mt-2">Homeowners who saved your profile</h2>
                </div>
                <span className="dome-chip">{saverClients.length} clients</span>
              </summary>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {saverClientsLoading && (
                  <div className="dome-panel p-5 text-body-sm text-muted-foreground">Loading interested clients...</div>
                )}

                {!saverClientsLoading && saverClients.length === 0 && (
                  <div className="dome-panel p-5 text-body-sm text-muted-foreground">
                    No one has saved your profile yet.
                  </div>
                )}

                {saverClients.map((client) => (
                  <div key={client.userId} className="dome-panel p-5 border border-border/60">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-body font-medium">{client.city || "Unknown City"}</h3>
                        <p className="text-body-sm text-muted-foreground">{client.projectType || "Project"}</p>
                      </div>
                      <span className="text-caption text-muted-foreground">
                        Saved {new Date(client.savedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1 text-body-sm">
                      <p>
                        <span className="text-muted-foreground">Budget:</span>{" "}
                        {formatBudgetRange(client.budgetRange?.min ?? null, client.budgetRange?.max ?? null)}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {(client.styleTags || []).length > 0 ? (
                        (client.styleTags || []).map((tag) => (
                          <span key={`${client.userId}-${tag}`} className="dome-chip bg-primary/10 border-primary/20 text-primary">
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-caption text-muted-foreground">No style tags</span>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end">
                      <motion.button
                        className="dome-button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startSaverConversationMutation.mutate(client.userId)}
                        disabled={startSaverConversationMutation.isPending}
                      >
                        Start Conversation
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </Container>
        </Section>

        {/* Lead Pipeline — Kanban */}
        <Section padding="small">
          <Container>
            {/* Avora Copilot — workload intelligence */}
            {projects.length > 0 && (
              <div className="mb-8">
                <AvoraProjectCopilot
                  compact
                  context={{
                    projectTitle: projects[0]?.title,
                    status: projects[0]?.status,
                    progress: projects[0]?.progress ?? 0,
                    estimatedBudget: projects[0]?.estimatedBudget ?? undefined,
                    estimatedTime: projects[0]?.estimatedTime ?? undefined,
                    milestones: projects[0]?.milestones?.map(m => ({ title: m.title, status: m.status, dueDate: m.dueDate ?? undefined })) ?? [],
                    consultationCount: consultations.length,
                    lastActivityDaysAgo: consultations[0]
                      ? Math.floor((Date.now() - new Date(consultations[0].createdAt).getTime()) / 86_400_000)
                      : 14,
                  }}
                />
              </div>
            )}
            <Reveal>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <span className="dome-kicker">Lead Pipeline</span>
                  <h2 className="text-display-sm mt-2">Consultation Requests</h2>
                </div>
                <span className="text-caption text-muted-foreground">{consultations.length} total</span>
              </div>
            </Reveal>

            {(() => {
              const stages: Array<{
                key: string;
                label: string;
                statuses: string[];
                accent: string;
              }> = [
                { key: "inquiry", label: "Inquiry", statuses: ["pending"], accent: "border-amber-300/60" },
                { key: "qualified", label: "Qualified", statuses: ["accepted"], accent: "border-blue-300/60" },
                { key: "active", label: "Active Project", statuses: ["active"], accent: "border-emerald-300/60" },
                { key: "completed", label: "Completed", statuses: ["completed", "closed", "rejected"], accent: "border-border/40" },
              ];

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {stages.map((stage) => {
                    const stageItems = consultations.filter((c) => stage.statuses.includes(c.status));
                    return (
                      <div key={stage.key} className={`dome-card p-4 border-t-2 ${stage.accent}`}>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-caption text-muted-foreground">{stage.label}</span>
                          <span className="dome-chip text-xs">{stageItems.length}</span>
                        </div>
                        <div className="space-y-3">
                          {stageItems.length === 0 && (
                            <div className="dome-panel p-4 text-center text-body-sm text-muted-foreground">
                              No {stage.label.toLowerCase()} leads
                            </div>
                          )}
                          {stageItems.map((request) => (
                            <ConsultationLeadCard
                              key={request._id}
                              request={request}
                              updateStatusMutation={updateStatusMutation}
                              createProjectMutation={createProjectMutation}
                              setSelectedConsultation={setSelectedConsultation}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
                  <span className="text-display-lg">₹{(stats?.monthlyEarnings ?? 0).toLocaleString()}</span>
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
                  <span className="text-display-lg">₹{(stats?.totalEarnings ?? profile?.earnings ?? 0).toLocaleString()}</span>
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
                <Link to={profile?.user?.slug ? `/architect/${profile.user.slug}` : `/architect/${profile?.user?.id ?? ""}`}>
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

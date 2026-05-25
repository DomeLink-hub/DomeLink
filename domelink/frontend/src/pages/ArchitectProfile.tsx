import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem, DepthCard } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import ChatModal from "@/components/chat/ChatModal";
import DomeFlow from "@/components/layout/DomeFlow";
import DomeTimeline from "@/components/layout/DomeTimeline";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import ConsultationModal from "@/components/consultation/ConsultationModal";
import ConsultationPaymentModal from "@/components/payments/ConsultationPaymentModal";
import { useNavigate } from "react-router-dom";
import { useAnalytics } from "@/hooks/useAnalytics";
import ArchitectDiscoveryCard from "@/components/discovery/ArchitectDiscoveryCard";
import TrustBadge, { TrustScoreMeter } from "@/components/trust/TrustBadge";
import type { VerificationTier } from "@/components/trust/TrustBadge";

const ArchitectProfile = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const track = useAnalytics();
  const { slug } = useParams<{ slug: string }>();
  const { data: architect, isLoading } = useQuery({
    queryKey: queryKeys.architectBySlug(slug || ""),
    queryFn: () => api.getArchitectBySlug(slug || ""),
    enabled: Boolean(slug),
  });
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const hasApiToken = Boolean(localStorage.getItem("domelink_token"));

  const { data: savedArchitects = [] } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
    enabled: hasApiToken,
  });
  const { data: portfolioProjects = [] } = useQuery({
    queryKey: queryKeys.portfolio(architect?._id || ""),
    queryFn: () => api.getPortfolio(architect!._id),
    enabled: Boolean(architect?._id),
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["architect-reviews", architect?._id],
    queryFn: () => api.getReviews(architect!._id),
    enabled: Boolean(architect?._id),
  });
  const { data: allArchitects = [] } = useQuery({
    queryKey: queryKeys.architects(),
    queryFn: () => api.getArchitects(),
    enabled: Boolean(architect?._id),
  });

  const profileStyles = useMemo(
    () => (architect?.designStyles?.length ? architect.designStyles : architect?.projectTypes?.length ? architect.projectTypes : architect?.templates?.map((template) => template.name) || []),
    [architect?.designStyles, architect?.projectTypes, architect?.templates],
  );

  const portfolioItems = portfolioProjects.length > 0 ? portfolioProjects : architect?.projects || [];
  const similarArchitects = useMemo(() => {
    if (!architect) return [];
    const normalizedCity = (architect.location || architect.citiesServed?.[0] || "").toLowerCase();
    const normalizedStyle = profileStyles.map((style) => style.toLowerCase());
    return allArchitects
      .filter((item) => item._id !== architect._id)
      .map((item) => ({
        item,
        score:
          (normalizedCity && (item.location || "").toLowerCase().includes(normalizedCity) ? 2 : 0) +
          normalizedStyle.reduce((total, style) => total + (item.designStyles?.some((value) => value.toLowerCase().includes(style)) ? 1 : item.projectTypes?.some((value) => value.toLowerCase().includes(style)) ? 1 : 0), 0) +
          (item.isVerified ? 1 : 0) +
          (item.rating || 0) / 2,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((entry) => entry.item);
  }, [allArchitects, architect, profileStyles]);

  const saveMutation = useMutation({
    mutationFn: () => api.saveArchitect(architect!._id),
    onSuccess: () => {
      toast.success("Architect saved");
      track("save", { architectId: architect?._id, action: "save" });
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedArchitects() });
    },
    onError: () => toast.error("Unable to save architect"),
  });

  const unsaveMutation = useMutation({
    mutationFn: () => api.unsaveArchitect(architect!._id),
    onSuccess: () => {
      toast.success("Removed from saved architects");
      track("save", { architectId: architect?._id, action: "unsave" });
      void queryClient.invalidateQueries({ queryKey: queryKeys.savedArchitects() });
    },
    onError: () => toast.error("Unable to update saved list"),
  });

  useEffect(() => {
    if (architect) {
      track("profile_view", { architectId: architect._id });
    }
  }, [architect, track]);

  if (isLoading) {
    return (
      <PageTransition>
        <Header />
        <div className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full bg-gradient-to-b from-foreground/5 to-background animate-pulse" />
          </div>
          <Header variant="minimal" />
          <div className="relative z-10 pt-32 pb-16">
            <Container>
              <div className="space-y-6 max-w-2xl">
                <div className="h-3 w-24 bg-border/60 rounded-full animate-pulse" />
                <div className="h-16 w-3/4 bg-border/40 rounded-xl animate-pulse" />
                <div className="h-4 w-1/2 bg-border/30 rounded-full animate-pulse" />
              </div>
            </Container>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  if (!architect) {
    return (
      <PageTransition>
        <Header />
        <Section padding="large">
          <Container>
            <div className="text-center">
              <h1 className="text-display-lg">Architect not found</h1>
              <Link to="/explore" className="text-caption link-underline mt-8 inline-block">
                Back to Explore
              </Link>
            </div>
          </Container>
        </Section>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Hero */}
      <div className="relative h-[70vh] min-h-[600px]">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src={architect.heroImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"}
            alt={architect.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 overlay-gradient" />
        </motion.div>

        <Header variant="transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="dome-kicker text-white/60">{architect.specialty || "Architect"}</span>
              <h1 className="text-display-xl text-white mb-4 dome-bracket">
                {architect.name}
              </h1>
              <p className="text-body-lg text-white/80">
                {architect.location || "Location not set"}
              </p>
            </motion.div>
          </Container>
        </div>
      </div>

      <main>
        {/* Trust Section */}
        <Section padding="small" className="border-b border-border/40">
          <Container>
            <Reveal>
              {(() => {
                const score = Math.round((architect.trustScore || 0) * 100);
                const tier: VerificationTier = architect.isVerified
                  ? score >= 80
                    ? "government"
                    : "portfolio"
                  : "new";

                // Derive expertise tags from designStyles / about text
                const expertiseTags: string[] = [
                  ...(architect.designStyles || []).slice(0, 4),
                ];
                const aboutLower = (architect.about || "").toLowerCase();
                if (aboutLower.includes("vastu") && !expertiseTags.includes("Vastu")) expertiseTags.push("Vastu");
                if ((aboutLower.includes("sustain") || aboutLower.includes("green")) && !expertiseTags.includes("Sustainable")) expertiseTags.push("Sustainable");
                if ((aboutLower.includes("luxury") || aboutLower.includes("premium")) && !expertiseTags.includes("Luxury")) expertiseTags.push("Luxury");

                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Verification badge */}
                    <div className="dome-card p-6 space-y-4">
                      <span className="dome-kicker">Verification</span>
                      <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                        tier === "government"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300"
                          : tier === "portfolio"
                          ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300"
                          : "bg-secondary border-border text-muted-foreground"
                      }`}>
                        <span>{tier === "government" ? "✦" : tier === "portfolio" ? "◈" : "◇"}</span>
                        {tier === "government" ? "Government Verified" : tier === "portfolio" ? "Portfolio Reviewed" : "New Studio"}
                      </div>
                      {expertiseTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {expertiseTags.map((tag) => (
                            <span key={tag} className="dome-chip text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Trust score meter */}
                    <div className="dome-card p-6 space-y-4">
                      <span className="dome-kicker">Trust Score</span>
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <span className="text-display-md">{score}</span>
                          <span className="text-caption text-muted-foreground mb-1">/ 100</span>
                        </div>
                        <TrustScoreMeter score={score} />
                      </div>
                      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-border/50">
                        <div>
                          <span className="text-caption text-muted-foreground block mb-1">Response</span>
                          <span className="text-body-sm">{"< 24 hours"}</span>
                        </div>
                        <div>
                          <span className="text-caption text-muted-foreground block mb-1">Completion</span>
                          <span className="text-body-sm">{architect.completedProjects ? `${Math.min(100, Math.round((architect.completedProjects / Math.max(architect.completedProjects + 2, 10)) * 100))}%` : "N/A"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Consultation fee + why this architect */}
                    <div className="dome-card p-6 space-y-4">
                      <span className="dome-kicker">Consultation</span>
                      <div>
                        <span className="text-caption text-muted-foreground block mb-1">Fee</span>
                        <span className="text-display-sm">₹{(architect.consultationFee || architect.startingPrice || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="space-y-2 pt-1 border-t border-border/50">
                        <span className="text-caption text-muted-foreground">Why this studio</span>
                        <ul className="space-y-1.5">
                          {architect.isVerified && (
                            <li className="flex items-center gap-2 text-body-sm">
                              <span className="text-emerald-600">✓</span> Verified credentials
                            </li>
                          )}
                          {(architect.completedProjects || 0) > 0 && (
                            <li className="flex items-center gap-2 text-body-sm">
                              <span className="text-emerald-600">✓</span> {architect.completedProjects} completed projects
                            </li>
                          )}
                          {(architect.rating || 0) >= 4 && (
                            <li className="flex items-center gap-2 text-body-sm">
                              <span className="text-emerald-600">✓</span> {architect.rating} / 5 client rating
                            </li>
                          )}
                          {architect.experience && (
                            <li className="flex items-center gap-2 text-body-sm">
                              <span className="text-emerald-600">✓</span> {architect.experience} experience
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </Reveal>
          </Container>
        </Section>

        {/* About */}
        <Section>
          <Container size="narrow">
            <Grid cols={2} gap="large">
              <Reveal>
                <span className="dome-kicker">About</span>
                <p className="text-body-lg leading-relaxed">
                  {architect.about || "This architect hasn't provided an about description yet."}
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="dome-flow pt-6">
                  <div className="dome-flow-items grid-cols-1 md:grid-cols-2">
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Rating</span>
                        <span className="text-display-md">{architect.rating || "New"}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Starting Price</span>
                        <span className="text-display-md">${(architect.startingPrice || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Experience</span>
                        <span className="text-body-lg">{architect.experience || "N/A"}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Team Size</span>
                        <span className="text-body-lg">{architect.teamSize || 1} people</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Verification</span>
                        <span className="text-body-lg">{architect.isVerified ? "Verified" : "Unverified"}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Consultation</span>
                        <span className="text-body-lg">₹{(architect.consultationFee || architect.startingPrice || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Completed Projects</span>
                        <span className="text-body-lg">{architect.completedProjects || portfolioItems.length || 0}</span>
                      </div>
                    </div>
                    <div className="dome-flow-item">
                      <span className="dome-node" />
                      <div>
                        <span className="text-caption text-muted-foreground block mb-2">Trust Score</span>
                        <span className="text-body-lg">{Math.round((architect.trustScore || 0) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>

        {/* Projects Gallery */}
        <Section className="bg-secondary/20">
          <Container>
            <Reveal>
              <div className="space-y-4 mb-16">
                <span className="dome-kicker">Portfolio</span>
                <h2 className="text-display-lg dome-bracket">Selected Work</h2>
              </div>
            </Reveal>

            {portfolioItems.length === 0 && (
              <Reveal>
                <div className="dome-panel p-16 text-center">
                  {/* Animated blueprint placeholder */}
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <motion.div className="absolute inset-0 rounded-full border border-border/40"
                      animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} />
                    <motion.div className="absolute inset-3 rounded-full border border-border/30"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="dome-node" />
                    </div>
                  </div>
                  <p className="text-body text-muted-foreground mb-2">Portfolio in progress</p>
                  <p className="text-body-sm text-muted-foreground max-w-sm mx-auto">
                    This studio hasn't uploaded projects yet. Their work will appear here once reviewed.
                  </p>
                </div>
              </Reveal>
            )}

            <StaggerContainer className="space-y-24">
              {portfolioItems.map((project: any, index: number) => (
                <StaggerItem key={project.id || index}>
                  <article className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center`}>
                    <motion.div
                      className={`image-zoom aspect-[4/3] overflow-hidden rounded-2xl ${index % 2 === 1 ? "lg:order-2" : ""}`}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <img
                        src={project.image || project.images?.[0] || architect.heroImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </motion.div>
                    <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                      <span className="text-caption text-muted-foreground block mb-3">{project.year}</span>
                      <h3 className="text-display-md mb-4">{project.title}</h3>
                      <p className="text-body text-muted-foreground mb-4">{project.location}</p>
                      {project.description && (
                        <p className="text-body-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>
                      )}
                      {project.area && <span className="dome-chip">{project.area}</span>}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* Services and Design Language */}
        {(architect.servicesOffered?.length || profileStyles.length || architect.templates?.length) && (
          <Section>
            <Container>
              <Reveal>
                <div className="space-y-4">
                  <span className="dome-kicker">Studio Profile</span>
                  <h2 className="text-display-lg dome-bracket">Services, styles, and footprint</h2>
                </div>
              </Reveal>

              <Grid cols={3} gap="default">
                <div className="dome-card p-6">
                  <div className="text-caption text-muted-foreground">Styles</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {profileStyles.map((style) => (
                      <span key={style} className="dome-chip">{style}</span>
                    ))}
                  </div>
                </div>
                <div className="dome-card p-6">
                  <div className="text-caption text-muted-foreground">Cities served</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(architect.citiesServed || [architect.location].filter(Boolean)).slice(0, 4).map((city) => (
                      <span key={city} className="dome-chip">{city}</span>
                    ))}
                  </div>
                </div>
                <div className="dome-card p-6">
                  <div className="text-caption text-muted-foreground">Services offered</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(architect.servicesOffered || architect.templates?.map((template) => template.name) || []).slice(0, 4).map((service) => (
                      <span key={service} className="dome-chip">{service}</span>
                    ))}
                  </div>
                </div>
              </Grid>

              {architect.templates?.length ? (
                <div className="mt-8">
                  <DomeTimeline
                    items={(architect.templates || []).map((template: any) => ({
                      meta: `₹${template.price.toLocaleString("en-IN")}`,
                      title: template.name,
                      description: template.description,
                    }))}
                  />
                </div>
              ) : null}
            </Container>
          </Section>
        )}

        {/* Reviews */}
        <Section>
          <Container>
            <Reveal>
              <div className="space-y-4 mb-8">
                <span className="dome-kicker">Client reviews</span>
                <h2 className="text-display-lg dome-bracket">What clients are saying</h2>
              </div>
            </Reveal>

            {reviews.length > 0 ? (
              <Grid cols={2} gap="default">
                {reviews.map((review, index) => (
                  <Reveal key={review._id || index} delay={index * 0.08}>
                    <DepthCard className="dome-card p-6 h-full">
                      <div className="flex items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="text-body font-medium">{review.reviewer?.name || "Anonymous"}</div>
                          <div className="text-caption text-muted-foreground">{review.project || "Residential project"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-caption text-muted-foreground">Rating</div>
                          <div className="text-body-lg">{review.rating} / 5</div>
                        </div>
                      </div>
                      <p className="text-body text-muted-foreground">{review.comment}</p>
                    </DepthCard>
                  </Reveal>
                ))}
              </Grid>
            ) : (
              <div className="dome-panel p-12 text-center">
                <motion.div className="w-12 h-12 mx-auto mb-4 relative"
                  animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                  <div className="absolute inset-0 rounded-full border border-border/40" />
                  <div className="absolute inset-2 rounded-full border border-border/20" />
                </motion.div>
                <p className="text-body text-muted-foreground">Client reviews will appear here once this studio starts collecting feedback.</p>
              </div>
            )}
          </Container>
        </Section>

        {/* Similar Architects */}
        <Section className="bg-secondary/20">
          <Container>
            <Reveal>
              <div className="flex items-center justify-between gap-4 mb-8">
                <div>
                  <span className="dome-kicker">Similar studios</span>
                  <h2 className="text-display-lg dome-bracket">Keep exploring the market</h2>
                </div>
                <Link to="/explore" className="text-caption link-underline">View all</Link>
              </div>
            </Reveal>

            {similarArchitects.length > 0 ? (
              <Grid cols={3} gap="default">
                {similarArchitects.map((similar, index) => (
                  <Reveal key={similar._id} delay={index * 0.08}>
                    <ArchitectDiscoveryCard architect={similar} />
                  </Reveal>
                ))}
              </Grid>
            ) : (
              <div className="dome-panel p-8 text-center text-muted-foreground">More studios will appear here as the marketplace grows.</div>
            )}
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-foreground text-background">
          <Container>
            <div className="max-w-2xl mx-auto">
              <Reveal>
                {/* Consultation Readiness Checklist */}
                <div className="mb-10 dome-card p-6 bg-background/10 border-background/20">
                  <span className="dome-kicker text-background/60 mb-4">Consultation Readiness</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                    {[
                      { label: "Portfolio reviewed", met: (architect.projects?.length || 0) > 0 || portfolioItems.length > 0 },
                      { label: "Government verified", met: !!architect.isVerified },
                      { label: "Response within 24h", met: true },
                      { label: "Consultation fee transparent", met: !!(architect.consultationFee || architect.startingPrice) },
                    ].map(({ label, met }) => (
                      <div key={label} className="flex items-center gap-2 text-body-sm text-background/80">
                        <span className={met ? "text-emerald-400" : "text-background/30"}>
                          {met ? "✓" : "○"}
                        </span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fee */}
                <div className="text-center mb-6">
                  <span className="text-caption text-background/50 block mb-1">Consultation Fee</span>
                  <span className="text-display-md text-background">
                    ₹{(architect.consultationFee || architect.startingPrice || 0).toLocaleString("en-IN")}
                  </span>
                </div>

                <h2 className="text-display-lg mb-6 dome-bracket text-center">
                  Ready to start your project?
                </h2>
                <p className="text-body-lg text-background/70 mb-8 max-w-xl mx-auto text-center">
                  Begin a conversation with {architect.name} to discuss your vision.
                </p>

                {/* What to expect */}
                <div className="mb-10 space-y-2">
                  <span className="text-caption text-background/50 block mb-3">What to expect</span>
                  {[
                    "A 45-minute discovery call to understand your brief, site, and budget",
                    "A written summary with initial design direction and next steps",
                    "A clear proposal with timeline, fees, and deliverables",
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-3 text-body-sm text-background/70">
                      <span className="text-background/40 mt-0.5">0{i + 1}</span>
                      {point}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    onClick={() => {
                      if (!hasApiToken) {
                        navigate(`/login?from=${encodeURIComponent(window.location.pathname)}`);
                        return;
                      }
                      setIsConsultationOpen(true);
                    }}
                    className="dome-button-outline border-background text-background hover:bg-background hover:text-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Book a Consultation
                  </motion.button>
                  {hasApiToken &&
                    (savedArchitects.some((item: any) => item._id === architect._id) ? (
                      <motion.button
                        onClick={() => unsaveMutation.mutate()}
                        className="dome-button-outline border-background text-background hover:bg-background hover:text-foreground"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Unsave
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={() => saveMutation.mutate()}
                        className="dome-button-outline border-background text-background hover:bg-background hover:text-foreground"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Save Architect
                      </motion.button>
                    ))}
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />

      <ChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        architect={architect as any}
        consultationId={activeConsultationId || undefined}
      />
      <ConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        architectId={architect._id}
        onComplete={(consultationId) => {
          setActiveConsultationId(consultationId);
          setIsPaymentOpen(true);
          track("consultation_start", { architectId: architect._id });
        }}
      />
      {activeConsultationId && (
        <ConsultationPaymentModal
          isOpen={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          architectId={architect._id}
          architectName={architect.name}
          consultationId={activeConsultationId}
          onPaymentSuccess={() => {
            void queryClient.invalidateQueries({ queryKey: ["payments"] });
            setIsChatModalOpen(true);
          }}
        />
      )}
    </PageTransition>
  );
};

export default ArchitectProfile;
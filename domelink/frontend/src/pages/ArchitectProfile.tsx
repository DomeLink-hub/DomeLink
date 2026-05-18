import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import ChatModal from "@/components/chat/ChatModal";
import DomeFlow from "@/components/layout/DomeFlow";
import DomeTimeline from "@/components/layout/DomeTimeline";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { toast } from "sonner";
import ConsultationModal from "@/components/consultation/ConsultationModal";
import { useAnalytics } from "@/hooks/useAnalytics";
import TiltCard from "@/components/ui/TiltCard";

const ArchitectProfile = () => {
  const queryClient = useQueryClient();
  const track = useAnalytics();
  const { slug } = useParams<{ slug: string }>();
  const { data: architect, isLoading } = useQuery({
    queryKey: queryKeys.architectBySlug(slug || ""),
    queryFn: () => api.getArchitectBySlug(slug || ""),
    enabled: Boolean(slug),
  });
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [activeConsultationId, setActiveConsultationId] = useState<string | null>(null);
  const hasApiToken = Boolean(localStorage.getItem("domelink_token"));

  const { data: savedArchitects = [] } = useQuery({
    queryKey: queryKeys.savedArchitects(),
    queryFn: api.getSavedArchitects,
    enabled: hasApiToken,
  });

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
        <Section padding="large">
          <Container>
            <div className="text-center text-muted-foreground">Loading architect...</div>
          </Container>
        </Section>
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
                  </div>
                </div>
              </Reveal>
            </Grid>
          </Container>
        </Section>

        {/* Projects Gallery */}
        <Section className="bg-secondary/30">
          <Container>
            <Reveal>
              <div className="space-y-4">
                <span className="dome-kicker">Portfolio</span>
                <h2 className="text-display-lg dome-bracket">Selected Work</h2>
              </div>
            </Reveal>

            {/* Defensive check for empty/undefined projects */}
            {(!architect.projects || architect.projects.length === 0) && (
              <Reveal>
                <div className="py-12">
                  <p className="text-muted-foreground">This architect hasn't uploaded any projects yet.</p>
                </div>
              </Reveal>
            )}

            <StaggerContainer className="space-y-24">
              {/* Fallback to [] guarantees .map won't crash */}
              {(architect.projects || []).map((project: any, index: number) => (
                <StaggerItem key={project.id || index}>
                  <article className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""}`}>
                    <TiltCard className={`image-zoom aspect-[4/3] ${index % 2 === 1 ? "lg:order-2" : ""}`}>
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </TiltCard>
                    <div className={index % 2 === 1 ? "lg:order-1 lg:text-right" : ""}>
                      <span className="text-caption text-muted-foreground block mb-2">
                        {project.year}
                      </span>
                      <h3 className="text-display-md mb-4">{project.title}</h3>
                      <p className="text-body text-muted-foreground mb-4">
                        {project.location}
                      </p>
                      {project.area && (
                        <span className="text-body-sm text-muted-foreground">
                          {project.area}
                        </span>
                      )}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* Templates */}
        {/* Safe check for templates array length */}
        {(architect.templates || []).length > 0 && (
          <Section>
            <Container>
              <Reveal>
                <div className="space-y-4">
                  <span className="dome-kicker">Services</span>
                  <h2 className="text-display-lg dome-bracket">How We Work</h2>
                </div>
              </Reveal>

              <DomeTimeline
                items={(architect.templates || []).map((template: any) => ({
                  meta: `$${template.price.toLocaleString()}`,
                  title: template.name,
                  description: template.description,
                }))}
              />
            </Container>
          </Section>
        )}

        {/* CTA */}
        <Section className="bg-foreground text-background">
          <Container>
            <div className="text-center">
              <Reveal>
                <h2 className="text-display-lg mb-6 dome-bracket">
                  Ready to start your project?
                </h2>
                <p className="text-body-lg text-background/70 mb-12 max-w-xl mx-auto">
                  Begin a conversation with {architect.name} to discuss your vision.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.button
                    onClick={() => setIsConsultationOpen(true)}
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
          setIsChatModalOpen(true);
          track("consultation_start", { architectId: architect._id });
        }}
      />
    </PageTransition>
  );
};

export default ArchitectProfile;
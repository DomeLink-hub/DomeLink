import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import { Container, Section } from "@/components/layout/Layout";
import Reveal, { StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import ChatModal from "@/components/chat/ChatModal";
import { api, type Architect, type Consultation } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { Link } from "react-router-dom";

const consultationStatusLabel: Record<Consultation["status"], string> = {
  pending: "Pending",
  active: "In Progress",
  closed: "Closed",
  accepted: "Accepted",
  completed: "Completed",
  rejected: "Rejected",
};

const HomeownerMessages = () => {
  const [activeConsultation, setActiveConsultation] = useState<Consultation | null>(null);

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });

  const { data: architects = [] } = useQuery({
    queryKey: queryKeys.architects(),
    queryFn: () => api.getArchitects(),
  });

  const selectedArchitect = useMemo(() => {
    if (!activeConsultation) return null;

    const matched = architects.find((architect) => architect._id === activeConsultation.architectId._id);
    if (matched) return matched;

    const fallback: Architect = {
      _id: activeConsultation.architectId._id,
      slug: activeConsultation.architectId.slug,
      name: activeConsultation.architectId.name,
      location: "",
      specialty: activeConsultation.architectId.specialty,
      rating: 0,
      startingPrice: 0,
      about: "",
      heroImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      projects: [],
      templates: [],
      experience: "",
      teamSize: 1,
    };

    return fallback;
  }, [activeConsultation, architects]);

  return (
    <PageTransition>
      <Header />
      <main>
        <Section className="pt-32" padding="small">
          <Container>
            <Reveal>
              <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <span className="text-caption text-muted-foreground">Homeowner Workspace</span>
                  <h1 className="text-display-lg mt-3">Messages</h1>
                  <p className="text-body text-muted-foreground mt-3 max-w-2xl">
                    Manage your architect conversations and continue each project thread in real time.
                  </p>
                </div>
                <div className="flex gap-4">
                  <Link to="/homeowner/consultations" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                    View consultation history
                  </Link>
                  <Link to="/explore" className="text-caption text-muted-foreground hover:text-foreground transition-colors link-underline">
                    Start new consultation
                  </Link>
                </div>
              </div>
            </Reveal>

            {isLoading ? (
              <div className="dome-panel p-8">
                <p className="text-body text-muted-foreground">Loading conversations...</p>
              </div>
            ) : consultations.length === 0 ? (
              <div className="dome-panel p-12 text-center">
                <p className="text-body text-muted-foreground mb-4">No conversations yet.</p>
                <Link to="/explore" className="text-caption link-underline">
                  Explore architects
                </Link>
              </div>
            ) : (
              <StaggerContainer className="space-y-4">
                {consultations.map((consultation) => (
                  <StaggerItem key={consultation._id}>
                    <div className="dome-card p-6 md:p-7 flex flex-wrap items-center justify-between gap-5">
                      <div>
                        <h3 className="text-body font-medium">{consultation.architectId.name}</h3>
                        <p className="text-body-sm text-muted-foreground mt-1 line-clamp-1">{consultation.message}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <span className="dome-chip">{consultationStatusLabel[consultation.status]}</span>
                          <span className="text-caption text-muted-foreground">
                            {new Date(consultation.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveConsultation(consultation)}
                        className="px-6 py-3 rounded-full bg-foreground text-background text-caption hover:bg-foreground/90 transition-colors"
                      >
                        Open Chat
                      </button>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </Container>
        </Section>
      </main>
      <Footer />

      {selectedArchitect && activeConsultation ? (
        <ChatModal
          isOpen={Boolean(activeConsultation)}
          onClose={() => setActiveConsultation(null)}
          architect={selectedArchitect}
          consultationId={activeConsultation._id}
        />
      ) : null}
    </PageTransition>
  );
};

export default HomeownerMessages;

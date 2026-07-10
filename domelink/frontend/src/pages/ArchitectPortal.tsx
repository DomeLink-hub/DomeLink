import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import Reveal from "@/components/animations/Reveal";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

const ArchitectPortal = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: queryKeys.architectStats(),
    queryFn: api.getMyArchitectStats,
  });
  const { data: consultations = [] } = useQuery({
    queryKey: queryKeys.consultations(),
    queryFn: api.getConsultations,
  });
  const { data: projects = [] } = useQuery({
    queryKey: ["architect-projects"],
    queryFn: api.getMyProjects,
  });

  const handleLogout = async () => {
    api.clearToken();
    navigate("/login?role=architect", { replace: true });
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Architect Console"
          title="Architect Portal"
          subtitle="Manage your active conversations, templates, and collaboration workspace."
          imageUrl="https://images.unsplash.com/photo-1489515217757-5fd1be406fef?w=1920&q=80"
          align="left"
          className="pt-20"
        />
        <Section padding="none" className="-mt-16">
          <Container>
            <div className="flex justify-end">
              <motion.button
                className="dome-button-outline"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
              >
                Logout
              </motion.button>
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 mb-10">
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Studio Stats</h3>
                  <span className="text-caption text-muted-foreground">Live data</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Total Requests</p>
                    <p className="text-display-sm mt-2">{stats?.totalRequests ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Accepted</p>
                    <p className="text-display-sm mt-2">{stats?.acceptedRequests ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Completed</p>
                    <p className="text-display-sm mt-2">{stats?.closedRequests ?? 0}</p>
                  </div>
                  <div className="dome-panel p-4">
                    <p className="text-caption text-muted-foreground">Total Earnings</p>
                    <p className="text-display-sm mt-2">₹{(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}</p>
                  </div>
                </div>
              </div>
              <div className="dome-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-display-sm">Active Projects</h3>
                  <span className="text-caption text-muted-foreground">{projects.filter(p => p.status !== "completed").length} active</span>
                </div>
                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-center space-y-2">
                    <span className="text-muted-foreground text-xl">◇</span>
                    <p className="text-body-sm text-muted-foreground">No projects yet</p>
                    <p className="text-caption text-muted-foreground">Projects appear here once a consultation is accepted</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {projects.slice(0, 5).map((project) => (
                      <div key={project.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40">
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium truncate">{project.title}</p>
                          <p className="text-caption text-muted-foreground">{project.status}</p>
                        </div>
                        {project.progress !== undefined && (
                          <div className="w-16">
                            <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                              <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Grid cols={3} gap="large">
              <div className="dome-panel p-6">
                <h3 className="text-display-sm mb-6">Overview</h3>
                <ul className="space-y-4 text-body-sm text-muted-foreground">
                  <li>Total Requests: {stats?.totalRequests ?? 0}</li>
                  <li>Accepted: {stats?.acceptedRequests ?? 0}</li>
                  <li>Completed: {stats?.closedRequests ?? 0}</li>
                  <li>Total Earnings: ₹{(stats?.totalEarnings ?? 0).toLocaleString("en-IN")}</li>
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="flex gap-3 text-body-sm text-muted-foreground">
                  <span className="dome-chip">Requests</span>
                  <span className="dome-chip">Messages</span>
                  <span className="dome-chip">Workspace</span>
                </div>

                <div className="dome-panel">
                  <div className="px-6 py-4 border-b border-border/60">
                    <h3 className="text-display-sm">Latest Requests</h3>
                  </div>
                  <div className="p-6 space-y-4">
                    {consultations.slice(0, 4).map((consultation) => (
                      <div key={consultation._id} className="rounded-xl border border-border p-4">
                        <div className="flex items-center justify-between gap-4">
                          <p className="text-body font-medium">{consultation.userId?.name ?? "Client"}</p>
                          <span className="dome-chip">{consultation.status}</span>
                        </div>
                        <p className="text-body-sm text-muted-foreground mt-2 line-clamp-2">{consultation.message}</p>
                      </div>
                    ))}
                    {consultations.length === 0 ? (
                      <p className="text-body-sm text-muted-foreground">No requests yet.</p>
                    ) : null}
                    <div className="pt-2">
                      <Link to="/architect/dashboard" className="text-caption link-underline">
                        Open full dashboard
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </Grid>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default ArchitectPortal;

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import Reveal from "@/components/animations/Reveal";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["myProjects"],
    queryFn: api.getMyProjects,
  });
  const primaryProject = projects[0];
  const { data: projectInsight } = useQuery({
    queryKey: ["projectInsight", primaryProject?.id],
    queryFn: () => api.summarizeProject(primaryProject),
    enabled: Boolean(primaryProject),
  });

  const handleLogout = async () => {
    api.clearToken();
    navigate("/login", { replace: true });
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Client Console"
          title="Client Dashboard"
          subtitle="Review your projects, packages, and private conversations with verified architects."
          imageUrl="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
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
            <Grid cols={3} gap="large">
              <div className="dome-panel p-6">
                <h3 className="text-display-sm mb-6">Menu</h3>
                <ul className="space-y-4 text-body-sm text-muted-foreground">
                  <li>Messages</li>
                  <li>My Packages</li>
                  <li>Templates</li>
                  <li>Collaboration Hub</li>
                </ul>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-wrap gap-3 text-body-sm text-muted-foreground">
                  <span className="dome-chip bg-primary/10 text-primary border-primary">Active Workspaces</span>
                  <span className="dome-chip">Consultations</span>
                  <span className="dome-chip">Templates</span>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="dome-panel p-6 border border-primary/20 bg-primary/5">
                    <div className="text-caption uppercase tracking-[0.2em] text-muted-foreground">Project Readiness Score</div>
                    <div className="mt-3 flex items-end gap-3">
                      <div className="text-5xl font-light text-primary">
                        {projectInsight ? `${projectInsight.readinessScore}` : "--"}
                      </div>
                      <div className="pb-1 text-body-sm text-muted-foreground">/ 100</div>
                    </div>
                    <p className="mt-4 text-body-sm text-muted-foreground">
                      {projectInsight?.summary || "We will summarize the strongest active workspace once a project is selected."}
                    </p>
                  </div>

                  <div className="dome-panel p-6">
                    <div className="text-caption uppercase tracking-[0.2em] text-muted-foreground">Style Intelligence</div>
                    <p className="mt-4 text-body-sm text-muted-foreground">
                      {projectInsight?.stylisticMatch || "Your design language will be evaluated against the current project brief."}
                    </p>
                    <div className="mt-6 rounded-xl border border-border/50 bg-background/50 p-4 text-body-sm text-foreground">
                      {projectInsight?.nextBestAction || "Open the workspace to refine scope and milestone timing."}
                    </div>
                  </div>
                </div>

                <div className="dome-panel">
                  <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                     <h3 className="text-display-sm">Your Projects</h3>
                     <span className="text-caption text-muted-foreground">{projects.length} workspace{projects.length === 1 ? "" : "s"}</span>
                  </div>
                  <div className="p-6 space-y-4">
                    {isLoading ? (
                      <div className="text-center text-muted-foreground text-sm">Loading projects...</div>
                    ) : projects.length > 0 ? (
                      projects.map(proj => (
                        <div key={proj.id} className="border border-border/40 p-4 rounded-xl flex items-center justify-between hover:border-border transition-colors">
                           <div>
                             <h4 className="font-medium text-lg mb-1">{proj.title}</h4>
                             <p className="text-sm text-muted-foreground">{proj.status.toUpperCase()} • {proj.progress ?? 0}%</p>
                           </div>
                           <Link to={`/homeowner/project/${proj.id}`} className="dome-button text-sm py-2">
                             Enter Workspace
                           </Link>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground text-sm italic py-8">
                        You have no active projects. Schedule a consultation to begin.
                      </div>
                    )}
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

export default ClientDashboard;

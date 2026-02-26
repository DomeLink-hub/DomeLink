import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import Reveal from "@/components/animations/Reveal";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";

const ClientDashboard = () => {
  const navigate = useNavigate();

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
                  <span className="dome-chip">Chat Interface</span>
                  <span className="dome-chip">Packages &amp; Pricing</span>
                  <span className="dome-chip">Project Templates</span>
                  <span className="dome-chip">Collaboration Hub</span>
                </div>

                <div className="dome-panel">
                  <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
                    <h3 className="text-display-sm">Conversation</h3>
                    <motion.button
                      className="dome-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Pay $20 for Premium Chat
                    </motion.button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <div className="inline-block bg-secondary/40 rounded-xl px-4 py-3 text-body-sm">
                        Welcome to DomeLink Chat!
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">10:00 AM</div>
                    </div>
                    <div>
                      <div className="inline-block bg-secondary/40 rounded-xl px-4 py-3 text-body-sm">
                        Hi, I'm interested in the residential package.
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">10:05 AM</div>
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

export default ClientDashboard;

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { MapPin, Layers, Wallet, Search } from "lucide-react";

const FindArchitects = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Discover"
          title={
            <>
              Connect with World-Class <span className="text-primary">Architects</span>
            </>
          }
          subtitle="Find verified, professional architects from around the globe for your dream project."
          imageUrl="https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container size="narrow">
            <Reveal delay={0.1}>
              <div className="dome-flow pt-6">
                <Grid cols={3} gap="default" className="items-end">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Location</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="City, Country"
                        className="w-full bg-transparent text-body-sm focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Specialty</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <Layers className="h-4 w-4 text-muted-foreground" />
                      <select className="w-full bg-transparent text-body-sm focus:outline-none">
                        <option>All Specialties</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Project Budget</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <select className="w-full bg-transparent text-body-sm focus:outline-none">
                        <option>Any Budget</option>
                      </select>
                    </div>
                  </div>
                </Grid>

                <div className="mt-6 flex justify-end">
                  <Link to="/choose">
                    <motion.button
                      className="dome-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Search className="h-4 w-4" />
                      Search Architects
                    </motion.button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default FindArchitects;

import { Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeFlow from "@/components/layout/DomeFlow";
import DomeOrbit from "@/components/layout/DomeOrbit";
import { MapPin, Layers, Wallet, Search } from "lucide-react";
const HeroScene = lazy(() => import("@/components/3d/HeroScene"));

const Index = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <section className="relative h-screen overflow-hidden bg-[#e7e3dc]">
          <div className="absolute inset-0 hidden md:block">
            <Suspense fallback={null}>
              <HeroScene />
            </Suspense>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.7, y: 0 }}
            transition={{ duration: 1.2, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center"
          >
            <motion.span
              initial={{ letterSpacing: "0.16em" }}
              animate={{ letterSpacing: "0.24em" }}
              transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display uppercase text-black/60 text-5xl md:text-7xl lg:text-[10rem]"
            >
              DomeLink
            </motion.span>
          </motion.div>

          <div className="absolute inset-0 z-10">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="DomeLink featured residence"
              className="h-full w-full object-cover object-center mix-blend-multiply opacity-95"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-black/15 to-transparent" />
          </div>

          <div className="relative z-20 h-full px-6 md:px-10 lg:px-14 pb-16">
            <div className="absolute left-6 md:left-10 lg:left-14 top-24">
              <div className="flex flex-wrap items-center gap-6 text-caption text-white/70 uppercase tracking-[0.35em]">
                <span>Residence</span>
                <span>DomeLink</span>
                <span>2026</span>
              </div>
            </div>

            <div className="flex h-full items-end">
              <div className="max-w-md">
                <p className="text-body text-white/85">
                  A refined collection of modern residences curated with verified architects.
                  Discover spaces that blend landscape, light, and lasting design.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Link to="/find-architects">
                    <motion.button
                      className="dome-button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Architects
                    </motion.button>
                  </Link>
                  <span className="text-caption text-white/60">From $6,500 / project</span>
                </div>
              </div>
            </div>
          </div>

        </section>

        <Section padding="small">
          <Container size="wide">
            <Reveal delay={0.1}>
              <div className="dome-flow pt-6">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                  <span className="text-caption text-muted-foreground">Rooms</span>
                  <span className="dome-chip">4+</span>
                  <span className="dome-chip">Residence</span>
                  <span className="dome-chip">Balcony</span>
                  <span className="dome-chip">Kitchen</span>
                  <span className="dome-chip">Garden</span>
                </div>
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
                        <option>$30k - $120k</option>
                      </select>
                    </div>
                  </div>
                </Grid>

                <div className="mt-8 flex justify-end">
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

        <Section padding="small">
          <Container>
            <Reveal>
              <div className="text-center space-y-4">
                <span className="dome-kicker">Curated Studios</span>
                <h2 className="text-display-md dome-bracket">Featured Architects</h2>
                <p className="text-body text-muted-foreground max-w-3xl mx-auto">
                  DomeLink connects you with verified architects in different areas by selecting your location, specialty, and budget. We provide you with a curated list of architects near you who match your specific project requirements.
                </p>
              </div>
            </Reveal>
            <div className="mt-12">
              <DomeFlow
                items={[
                  {
                    meta: "01",
                    title: "Select Your Location",
                    description:
                      "Choose your city, region, or rural area from our comprehensive database sourced from government geographical records.",
                  },
                  {
                    meta: "02",
                    title: "Choose Your Specialty & Budget",
                    description:
                      "Select from residential, commercial, sustainable design, or other architectural specialties with your ideal budget range.",
                  },
                  {
                    meta: "03",
                    title: "Get Verified Architects",
                    description:
                      "Receive a curated list of verified architects in your area who match your criteria.",
                  },
                ]}
              />
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container size="narrow">
            <Reveal>
              <div className="text-center space-y-4">
                <Link to="/verified-architects" className="block">
                  <h2 className="text-display-md dome-bracket">Government-Verified Architects</h2>
                </Link>
                <p className="text-body text-muted-foreground">
                Every architect on DomeLink is verified through official government licensing authorities including:
                </p>
              </div>
            </Reveal>
            <div className="mt-12">
              <DomeOrbit
                centerTitle="Verified"
                centerSubtitle="Government-licensed networks"
                nodes={[
                  { label: "COA India", position: { top: "5%", left: "18%" } },
                  { label: "NCARB", position: { top: "10%", left: "68%" } },
                  { label: "ARB", position: { top: "42%", left: "82%" } },
                  { label: "CALA", position: { top: "75%", left: "65%" } },
                  { label: "AACA", position: { top: "80%", left: "20%" } },
                  { label: "State Boards", position: { top: "42%", left: "5%" } },
                ]}
              />
            </div>
            <div className="mt-10 text-center">
              <Link to="/choose">
                <motion.button
                  className="dome-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Find Architects Now
                </motion.button>
              </Link>
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <DomeOrbit
              centerTitle="Studio Horizon"
              centerSubtitle="Residential + Coastal"
              nodes={[
                { label: "Urban Loft", position: { top: "8%", left: "18%" } },
                { label: "Penthouse Grove", position: { top: "12%", left: "68%" } },
                { label: "Skyline Family", position: { top: "42%", left: "82%" } },
                { label: "Terrace", position: { top: "76%", left: "66%" } },
                { label: "Balcony", position: { top: "80%", left: "22%" } },
                { label: "Garden", position: { top: "42%", left: "5%" } },
              ]}
            />
          </Container>
        </Section>

        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Index;

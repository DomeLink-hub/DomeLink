import { Link } from "react-router-dom";
import { Suspense, lazy } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Reveal, { CinematicReveal, StaggerContainer, StaggerItem, DepthCard } from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeFlow from "@/components/layout/DomeFlow";
import DomeOrbit from "@/components/layout/DomeOrbit";
import { MapPin, Layers, Wallet, Search, ArrowRight } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
const HeroScene = lazy(() => import("@/components/3d/HeroScene"));

const SectionMark = ({ label }: { label: string }) => (
  <div className="flex items-center gap-4 mb-12">
    <span className="dome-orb" />
    <span className="text-caption text-muted-foreground tracking-[0.3em]">{label}</span>
    <div className="flex-1 h-px bg-border/40" />
  </div>
);

const Index = () => {
  const activityData = [
    { label: "Mon", value: 24 }, { label: "Tue", value: 36 },
    { label: "Wed", value: 42 }, { label: "Thu", value: 38 },
    { label: "Fri", value: 52 }, { label: "Sat", value: 44 },
    { label: "Sun", value: 60 },
  ];

  return (
    <PageTransition>
      <Header />
      <main>

        {/* 01 — HERO */}
        <section className="relative h-screen overflow-hidden bg-[#0d0c0b]">
          <div className="absolute inset-0 hidden md:block">
            <Suspense fallback={null}><HeroScene /></Suspense>
          </div>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 0.06 }}
            transition={{ duration: 2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none"
          >
            <motion.span
              initial={{ letterSpacing: "0.12em" }} animate={{ letterSpacing: "0.22em" }}
              transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
              className="font-display uppercase text-white text-5xl md:text-7xl lg:text-[9rem]"
            >DomeLink</motion.span>
          </motion.div>
          <div className="absolute inset-0 z-10">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="DomeLink featured residence" className="h-full w-full object-cover object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
          <div className="absolute left-6 md:left-10 lg:left-14 top-24 z-20">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap items-center gap-6 text-caption text-white/50 uppercase tracking-[0.35em]">
              <span>Residence</span>
              <span className="w-px h-3 bg-white/30" />
              <span>DomeLink</span>
              <span className="w-px h-3 bg-white/30" />
              <span>2026</span>
            </motion.div>
          </div>
          <div className="relative z-20 h-full px-6 md:px-10 lg:px-14 pb-20">
            <div className="flex h-full items-end">
              <div className="max-w-lg">
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-body-lg text-white/80 mb-8 leading-relaxed">
                  The elite architectural ecosystem. Discover visionary spaces, generate exact feasibility reports with Avora AI, and seamlessly collaborate with government-verified architectural studios.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-wrap items-center gap-4">
                  <Link to="/find-architects">
                    <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Explore Network <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link to="/demo-dashboard" title="Recruiter & Investor Quick Start">
                    <motion.button className="dome-button-outline border-white/30 text-white hover:border-white hover:bg-white/10"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Recruiter Quick Tour
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-8 right-8 z-20 flex flex-col items-center gap-2">
            <motion.div className="w-px h-12 bg-white/30"
              animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "top" }} />
          </motion.div>
        </section>

        {/* 02 — SEARCH */}
        <Section padding="small">
          <Container size="wide">
            <CinematicReveal delay={0.05}>
              <div className="dome-panel p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="text-caption text-muted-foreground">Filter by</span>
                  {["Residence","Villa","Apartment","Commercial","Farmhouse"].map(tag => (
                    <span key={tag} className="dome-chip cursor-pointer hover:border-foreground/40 transition-colors">{tag}</span>
                  ))}
                </div>
                <Grid cols={3} gap="default" className="items-end">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Location</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <input type="text" placeholder="City, Country" className="w-full bg-transparent text-body-sm focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Specialty</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <Layers className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <select className="w-full bg-transparent text-body-sm focus:outline-none">
                        <option>All Specialties</option>
                        <option>Residential</option>
                        <option>Commercial</option>
                        <option>Sustainable</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">Project Budget</label>
                    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-3">
                      <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <select className="w-full bg-transparent text-body-sm focus:outline-none">
                        <option>₹30L – ₹1.2Cr</option>
                        <option>₹1.2Cr – ₹4Cr</option>
                        <option>₹4Cr+</option>
                      </select>
                    </div>
                  </div>
                </Grid>
                <div className="mt-6 flex justify-end">
                  <Link to="/choose">
                    <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Search className="h-4 w-4" /> Search Architects
                    </motion.button>
                  </Link>
                </div>
              </div>
            </CinematicReveal>
          </Container>
        </Section>

        {/* 03 — THE PROBLEM */}
        <Section padding="default">
          <Container>
            <SectionMark label="The Problem" />
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-center">
              <Reveal>
                <h2 className="text-display-lg dome-bracket leading-tight">
                  Finding the right architect shouldn't feel like a gamble.
                </h2>
                <p className="text-body text-muted-foreground mt-6 max-w-lg leading-relaxed">
                  Most homeowners spend months searching, comparing unverified portfolios, and guessing at costs. DomeLink replaces uncertainty with intelligence.
                </p>
                <Link to="/how-it-works" className="mt-8 inline-block">
                  <motion.button className="dome-button-outline" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    How it works
                  </motion.button>
                </Link>
              </Reveal>
              <Reveal delay={0.15} direction="left">
                <StaggerContainer className="space-y-4">
                  {[
                    { n: "01", title: "Unverified portfolios", body: "Every DomeLink architect is government-licensed and portfolio-reviewed." },
                    { n: "02", title: "Opaque pricing", body: "Avora Intelligence generates precise regional estimates before you speak to anyone." },
                    { n: "03", title: "No matching logic", body: "DomeLink matches by city, style, budget, complexity, and cultural requirements." },
                  ].map(item => (
                    <StaggerItem key={item.n}>
                      <DepthCard className="dome-card p-5 flex gap-5">
                        <span className="text-caption text-muted-foreground flex-shrink-0 w-6 pt-0.5">{item.n}</span>
                        <div>
                          <p className="text-body font-medium mb-1">{item.title}</p>
                          <p className="text-body-sm text-muted-foreground">{item.body}</p>
                        </div>
                      </DepthCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 04 — AVORA */}
        <Section padding="default" className="bg-foreground text-background overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
          <Container>
            <SectionMark label="Avora Intelligence" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <Reveal>
                <h2 className="text-display-lg leading-tight">
                  Know your project's true cost before you meet an architect.
                </h2>
                <p className="text-body text-background/60 mt-6 max-w-lg leading-relaxed">
                  Avora analyses your city, plot, style, and lifestyle requirements against regional construction data to generate a precise feasibility report.
                </p>
                <Link to="/homeowner/avora-estimate" className="mt-8 inline-block">
                  <motion.button className="dome-button-outline border-background/30 text-background hover:border-background hover:bg-background/10"
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Run Avora Estimate <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </Reveal>
              <Reveal delay={0.15} direction="left">
                <div className="space-y-3">
                  {[
                    { label: "Cost Range",         value: "₹1.2Cr – ₹1.6Cr", note: "Bangalore · 2,400 sq ft · G+2" },
                    { label: "Complexity Score",   value: "7 / 10",           note: "Moderate-complex · Premium Studio" },
                    { label: "Timeline",           value: "18 months",        note: "Including interiors and landscape" },
                    { label: "Budget Feasibility", value: "Feasible",         note: "Within stated range with 12% buffer" },
                  ].map((item, i) => (
                    <motion.div key={item.label}
                      className="flex items-center justify-between p-4 rounded-xl border border-background/10 bg-background/5"
                      initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}>
                      <div>
                        <p className="text-caption text-background/40">{item.label}</p>
                        <p className="text-body-sm text-background/50 mt-0.5">{item.note}</p>
                      </div>
                      <p className="text-body font-medium text-background">{item.value}</p>
                    </motion.div>
                  ))}
                  <p className="text-caption text-background/25 text-center pt-2">Sample report · Avora Intelligence</p>
                </div>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 05 — ACTIVITY LENS */}
        <Section padding="default">
          <Container>
            <SectionMark label="Platform Intelligence" />
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-12 items-center">
              <Reveal>
                <h2 className="text-display-lg dome-bracket">Design intelligence in motion</h2>
                <p className="text-body text-muted-foreground mt-4 max-w-xl leading-relaxed">
                  DomeLink surfaces momentum across briefs, consultations, and studio engagement.
                </p>
                <StaggerContainer className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { label: "Live briefs",    value: "186",  note: "Active intake" },
                    { label: "Avg response",   value: "3.1h", note: "First shortlist" },
                    { label: "Consultations",  value: "64",   note: "In progress" },
                  ].map(s => (
                    <StaggerItem key={s.label}>
                      <DepthCard className="dome-card p-4">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <p className="text-caption text-muted-foreground">{s.label}</p>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-border/40 text-muted-foreground">Demo</span>
                        </div>
                        <p className="text-display-sm mt-1">{s.value}</p>
                        <p className="text-body-sm text-muted-foreground mt-1">{s.note}</p>
                      </DepthCard>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </Reveal>
              <Reveal delay={0.15} direction="left">
                <DepthCard className="dome-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-display-sm">Weekly Pulse</h3>
                    <span className="text-caption text-muted-foreground">Demo</span>
                  </div>
                  <ChartContainer config={{ value: { label: "Engagement", color: "hsl(var(--primary))" } }} className="h-52">
                    <AreaChart data={activityData} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area type="monotone" dataKey="value" stroke="var(--color-value)" fill="var(--color-value)" fillOpacity={0.15} />
                    </AreaChart>
                  </ChartContainer>
                </DepthCard>
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* 06 — DISCOVERY */}
        <Section padding="default" className="bg-secondary/20">
          <Container>
            <SectionMark label="Discovery Ecosystem" />
            <CinematicReveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h2 className="text-display-lg dome-bracket">Curated studios, matched to your vision</h2>
                <p className="text-body text-muted-foreground mt-4">
                  AI-powered matching that understands your project's complexity, cultural requirements, and design language.
                </p>
              </div>
            </CinematicReveal>
            <DomeFlow items={[
              { meta: "01", title: "Select Your Location", description: "Choose your city from verified studios across India's major metros and tier-2 cities." },
              { meta: "02", title: "Define Specialty & Budget", description: "Select from residential, commercial, sustainable, or luxury specialties with your investment range." },
              { meta: "03", title: "Get Matched Architects", description: "Receive a curated shortlist matched to your project's complexity and cultural requirements." },
            ]} />
            <div className="mt-12 text-center">
              <Link to="/find-architects">
                <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Explore Architects <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
            </div>
          </Container>
        </Section>

        {/* 07 — VERIFIED NETWORK */}
        <Section padding="default">
          <Container size="narrow">
            <SectionMark label="Trust Layer" />
            <CinematicReveal>
              <div className="text-center space-y-4 mb-12">
                <Link to="/verified-architects">
                  <h2 className="text-display-lg dome-bracket hover:opacity-80 transition-opacity">Government-Verified Architects</h2>
                </Link>
                <p className="text-body text-muted-foreground max-w-xl mx-auto">
                  Every architect on DomeLink is verified through official government licensing authorities.
                </p>
              </div>
            </CinematicReveal>
            <DomeOrbit
              centerTitle="Verified" centerSubtitle="Government-licensed networks"
              nodes={[
                { label: "COA India",    position: { top: "5%",  left: "18%" } },
                { label: "NCARB",        position: { top: "10%", left: "68%" } },
                { label: "ARB",          position: { top: "42%", left: "82%" } },
                { label: "CALA",         position: { top: "75%", left: "65%" } },
                { label: "AACA",         position: { top: "80%", left: "20%" } },
                { label: "State Boards", position: { top: "42%", left: "5%"  } },
              ]}
            />
            <div className="mt-12 text-center">
              <Link to="/choose">
                <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  Find Architects Now
                </motion.button>
              </Link>
            </div>
          </Container>
        </Section>

        {/* 08 — EDITORIAL STATS */}
        <Section padding="default" className="bg-foreground text-background">
          <Container>
            <CinematicReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: "1,200+", label: "Verified architects" },
                  { value: "48h",    label: "Avg. approval time" },
                  { value: "₹6,500", label: "Starting consultation" },
                  { value: "94%",    label: "Client satisfaction" },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-display-lg text-background">{stat.value}</p>
                    <p className="text-caption text-background/50 mt-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </CinematicReveal>
          </Container>
        </Section>

        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default Index;

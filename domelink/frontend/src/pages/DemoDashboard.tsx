import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Container, Section, Grid } from "@/components/layout/Layout";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import Reveal, { CinematicReveal, StaggerContainer, StaggerItem } from "@/components/animations/Reveal";
import DomeCTA from "@/components/layout/DomeCTA";
import { ArrowRight } from "lucide-react";

/* ── Demo data — no API calls needed ─────────────────────────── */
const DEMO_STATS = [
  { label: "Verified Architects", value: "1,200+", note: "Government-licensed studios" },
  { label: "Consultations",       value: "3,400+", note: "Completed across India" },
  { label: "Avg Response",        value: "3.1h",   note: "First architect shortlist" },
  { label: "Client Satisfaction", value: "94%",    note: "Post-consultation rating" },
];

const DEMO_FEATURES = [
  {
    label: "Avora Intelligence",
    description: "AI-powered architectural feasibility engine. Generates cost ranges, complexity scores, and architect tier recommendations from 5 questions.",
    href: "/homeowner/avora-estimate",
    cta: "Try Avora Estimate",
  },
  {
    label: "Architect Discovery",
    description: "Smart matching across 1,200+ verified studios. Filters by city, style, budget, complexity, vastu, and sustainability expertise.",
    href: "/explore",
    cta: "Explore Architects",
  },
  {
    label: "Project Copilot",
    description: "Contextual AI project health engine. Monitors momentum, timeline confidence, communication health, and budget stability in real time.",
    href: "/homeowner/dashboard",
    cta: "View Dashboard",
  },
  {
    label: "Trust Ecosystem",
    description: "Three-tier verification system (Government Verified, Portfolio Reviewed, New Studio) with animated trust score meters and expertise tags.",
    href: "/find-architects",
    cta: "Browse Studios",
  },
  {
    label: "Consultation Pipeline",
    description: "Kanban-style lead management for architects. Inquiry → Qualified → Active Project → Completed, with AI lead scoring on each card.",
    href: "/architect/dashboard",
    cta: "Architect View",
  },
  {
    label: "Admin Intelligence",
    description: "Platform health metrics, verification queue, conversion analytics, webhook monitoring, and upload moderation in one control center.",
    href: "/admin/dashboard",
    cta: "Admin View",
  },
];

const DEMO_CREDENTIALS = [
  { role: "Homeowner",  email: "demo.homeowner@domelink.ai",  password: "Demo@2026" },
  { role: "Architect",  email: "demo.architect@domelink.ai",  password: "Demo@2026" },
  { role: "Admin",      email: "demo.admin@domelink.ai",      password: "Demo@2026" },
];

export default function DemoDashboard() {
  return (
    <PageTransition>
      <Header />
      <main>
        {/* Hero */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
              alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-background" />
          </div>
          <div className="relative z-10 pt-40 pb-32 px-6 md:px-10 lg:px-14">
            <Container>
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
                <p className="text-caption text-white/40 tracking-[0.4em] mb-4">Platform Showcase</p>
                <h1 className="text-display-lg text-white dome-bracket mb-6">DomeLink Demo</h1>
                <p className="text-body-lg text-white/60 max-w-2xl mb-10">
                  An AI-powered architectural ecosystem connecting Indian homeowners with verified studios. Explore the full platform experience below.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/signup">
                    <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                  <Link to="/homeowner/avora-estimate">
                    <motion.button className="dome-button-outline border-white/30 text-white hover:border-white hover:bg-white/10"
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      Try Avora Estimate
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </Container>
          </div>
        </div>

        {/* Stats */}
        <Section padding="small">
          <Container>
            <CinematicReveal>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {DEMO_STATS.map(s => (
                  <div key={s.label} className="dome-card p-6 text-center">
                    <p className="text-display-md">{s.value}</p>
                    <p className="text-caption text-muted-foreground mt-2">{s.label}</p>
                    <p className="text-body-sm text-muted-foreground mt-1">{s.note}</p>
                  </div>
                ))}
              </div>
            </CinematicReveal>
          </Container>
        </Section>

        {/* Feature showcase */}
        <Section padding="default">
          <Container>
            <Reveal>
              <div className="mb-12">
                <span className="dome-kicker mb-4">Platform Features</span>
                <h2 className="text-display-lg dome-bracket">What DomeLink does</h2>
              </div>
            </Reveal>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_FEATURES.map(f => (
                <StaggerItem key={f.label}>
                  <div className="dome-card p-6 h-full flex flex-col">
                    <p className="text-caption text-muted-foreground mb-2">{f.label}</p>
                    <p className="text-body text-muted-foreground flex-1 mb-6">{f.description}</p>
                    <Link to={f.href}>
                      <motion.button className="dome-button-outline w-full justify-center"
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                        {f.cta}
                      </motion.button>
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </Container>
        </Section>

        {/* Demo credentials */}
        <Section padding="default" className="bg-secondary/20">
          <Container size="narrow">
            <Reveal>
              <div className="mb-8">
                <span className="dome-kicker mb-4">Demo Access</span>
                <h2 className="text-display-md dome-bracket">Try the full experience</h2>
                <p className="text-body text-muted-foreground mt-4">
                  Use these credentials to explore each role. Data is seeded for demonstration purposes.
                </p>
              </div>
            </Reveal>
            <div className="space-y-4">
              {DEMO_CREDENTIALS.map(c => (
                <Reveal key={c.role}>
                  <div className="dome-card p-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-body font-medium">{c.role}</p>
                      <p className="text-body-sm text-muted-foreground mt-1">{c.email}</p>
                      <p className="text-caption text-muted-foreground mt-0.5">Password: {c.password}</p>
                    </div>
                    <Link to={`/login?role=${c.role.toLowerCase()}`}>
                      <motion.button className="dome-button-outline"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Sign in as {c.role}
                      </motion.button>
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        {/* Tech stack */}
        <Section padding="default">
          <Container size="narrow">
            <Reveal>
              <div className="mb-8">
                <span className="dome-kicker mb-4">Architecture</span>
                <h2 className="text-display-md dome-bracket">Built with</h2>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { layer: "Frontend",    stack: "React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion" },
                { layer: "Backend",     stack: "Node.js · Express · TypeScript · Prisma ORM · PostgreSQL" },
                { layer: "AI",          stack: "Groq (Llama 3.3 70B) · Avora Intelligence Engine" },
                { layer: "Storage",     stack: "Cloudinary · Supabase PostgreSQL · MongoDB (legacy)" },
                { layer: "Payments",    stack: "Razorpay · Webhook verification · Invoice generation" },
                { layer: "Real-time",   stack: "Socket.io · Presence tracking · Live chat" },
              ].map(t => (
                <Reveal key={t.layer}>
                  <div className="dome-card p-5">
                    <p className="text-caption text-muted-foreground mb-2">{t.layer}</p>
                    <p className="text-body-sm">{t.stack}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>

        <DomeCTA
          title="Ready to explore the full platform?"
          subtitle="Sign up as a homeowner to run an Avora estimate, or as an architect to manage your studio pipeline."
          buttonText="Get Started"
        />
      </main>
      <Footer />
    </PageTransition>
  );
}

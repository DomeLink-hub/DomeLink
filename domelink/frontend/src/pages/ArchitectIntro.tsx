import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeFlow from "@/components/layout/DomeFlow";
import DomeTimeline from "@/components/layout/DomeTimeline";

const benefits = [
  {
    title: "Reach Discerning Clients",
    description: "Connect with homeowners who value exceptional design and are ready to invest in their vision.",
  },
  {
    title: "Control Your Workflow",
    description: "Accept projects that align with your practice. Set your own rates and availability.",
  },
  {
    title: "Showcase Your Portfolio",
    description: "Present your work in a gallery-quality format that lets your architecture speak for itself.",
  },
  {
    title: "Simple Onboarding",
    description: "Our verification process is thorough but efficient. Most architects are approved within 48 hours.",
  },
  {
    title: "Fair Commission",
    description: "We only succeed when you do. Our platform fee is transparent and competitive.",
  },
  {
    title: "Team Collaboration",
    description: "Invite collaborators, share notes, and manage projects together in one place.",
  },
];

const ArchitectIntro = () => {
  return (
    <PageTransition>
      {/* Hero */}
      <div className="relative min-h-screen flex items-end">
        <motion.div
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
            alt="Architecture studio"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        </motion.div>

        <Header variant="minimal" />

        <div className="relative z-10 w-full p-8 md:p-16 pb-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl"
            >
              <span className="dome-kicker text-white/60">For Architects</span>
              <h1 className="text-display-xl text-white mb-8 dome-bracket">
                Grow your practice with clients who value design
              </h1>
              <p className="text-body-lg text-white/70 mb-12 max-w-xl">
                Join a curated network of architects connecting with homeowners 
                ready to invest in exceptional residential design.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <motion.button
                    className="dome-button bg-white text-foreground hover:bg-white/90"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply to Join
                  </motion.button>
                </Link>
                <Link to="/explore">
                  <motion.button
                    className="dome-button-outline border-white text-white hover:bg-white hover:text-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Platform
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </Container>
        </div>
      </div>

      <main>
        {/* Benefits */}
        <Section>
          <Container>
            <Reveal>
              <div className="space-y-4">
                <span className="dome-kicker">Why DomeLink</span>
                <h2 className="text-display-lg dome-bracket max-w-2xl">
                  A platform designed for how architects work
                </h2>
              </div>
            </Reveal>

            <DomeFlow
              items={benefits.map((benefit, index) => ({
                meta: `0${index + 1}`,
                title: benefit.title,
                description: benefit.description,
              }))}
            />
          </Container>
        </Section>

        {/* How It Works */}
        <Section className="bg-secondary/20">
          <Container size="narrow">
            <Reveal>
              <div className="space-y-4">
                <span className="dome-kicker">Getting Started</span>
                <h2 className="text-display-lg dome-bracket">
                  Simple onboarding, exceptional results
                </h2>
              </div>
            </Reveal>

            <DomeTimeline
              items={[
                {
                  meta: "01",
                  title: "Apply",
                  description:
                    "Submit your portfolio and credentials. Our team reviews every application to ensure quality and fit.",
                },
                {
                  meta: "02",
                  title: "Build Your Profile",
                  description:
                    "Showcase your best work, set your specialties, and define your ideal projects. Your profile is your gallery.",
                },
                {
                  meta: "03",
                  title: "Connect",
                  description:
                    "Receive inquiries from homeowners who resonate with your work. Accept the projects that excite you.",
                },
                {
                  meta: "04",
                  title: "Create",
                  description:
                    "Do what you do best. DomeLink handles the introductions—you handle the architecture.",
                },
              ]}
            />
          </Container>
        </Section>

        {/* CTA */}
        <Section className="bg-foreground text-background">
          <Container>
            <div className="text-center">
              <Reveal>
                <h2 className="text-display-lg mb-6 dome-bracket">
                  Ready to join?
                </h2>
                <p className="text-body-lg text-background/70 mb-12 max-w-xl mx-auto">
                  Apply today and start connecting with clients who value exceptional design.
                </p>
                <Link to="/signup">
                  <motion.button
                    className="dome-button-outline border-background text-background hover:bg-background hover:text-foreground"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply to Join
                  </motion.button>
                </Link>
              </Reveal>
            </div>
          </Container>
        </Section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default ArchitectIntro;

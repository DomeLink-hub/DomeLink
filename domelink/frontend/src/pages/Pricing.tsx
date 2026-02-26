import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeTimeline from "@/components/layout/DomeTimeline";
import { motion } from "framer-motion";

const Pricing = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Pricing"
          title="Simple, transparent pricing"
          subtitle="Connect with world-class architects through our pay-per-chat model, or unlock unlimited access with our premium subscription."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        {/* Pricing Options */}
        <Section padding="small">
          <Container>
            <div className="dome-timeline">
              <div className="dome-timeline-item">
                <span className="text-caption text-muted-foreground block mb-3">
                  Pay Per Conversation
                </span>
                <h2 className="text-display-md mb-2">Chat Access</h2>
                <div className="text-display-lg mb-6">$49</div>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Direct access to one architect</PricingFeature>
                  <PricingFeature>7 days of unlimited messaging</PricingFeature>
                  <PricingFeature>Initial project consultation</PricingFeature>
                  <PricingFeature>Portfolio & template access</PricingFeature>
                </ul>
                <motion.a
                  href="/explore"
                  className="dome-button-outline justify-center"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Browse Architects
                </motion.a>
              </div>
              <div className="dome-timeline-item">
                <span className="text-caption text-muted-foreground block mb-3">
                  Premium Subscription
                </span>
                <h2 className="text-display-md mb-2">Unlimited</h2>
                <div className="text-display-lg mb-2">$199</div>
                <span className="text-body-sm text-muted-foreground mb-6 block">per month</span>
                <ul className="space-y-3 mb-8">
                  <PricingFeature>Unlimited architect conversations</PricingFeature>
                  <PricingFeature>Priority response from architects</PricingFeature>
                  <PricingFeature>Exclusive portfolio previews</PricingFeature>
                  <PricingFeature>Video consultation scheduling</PricingFeature>
                  <PricingFeature>Dedicated account manager</PricingFeature>
                  <PricingFeature>Early access to new architects</PricingFeature>
                </ul>
                <motion.button
                  className="dome-button justify-center"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Coming Soon
                </motion.button>
              </div>
            </div>
          </Container>
        </Section>

        {/* How It Works */}
        <Section>
          <Container size="narrow">
            <Reveal>
              <div className="space-y-4">
                <span className="dome-kicker">How It Works</span>
                <h2 className="text-display-lg dome-bracket">
                  A simple path to exceptional design
                </h2>
              </div>
            </Reveal>

            <DomeTimeline
              items={[
                {
                  meta: "01",
                  title: "Explore Architects",
                  description:
                    "Browse our curated network of verified architects. Filter by specialty, location, budget, and style to find your perfect match.",
                },
                {
                  meta: "02",
                  title: "Start a Conversation",
                  description:
                    "Purchase chat access to connect directly with your chosen architect. Share your vision, ask questions, and explore possibilities.",
                },
                {
                  meta: "03",
                  title: "Begin Your Project",
                  description:
                    "When you find the right fit, move forward with confidence. Your architect will guide you through the entire design process.",
                },
              ]}
            />
          </Container>
        </Section>

        {/* FAQ */}
        <Section className="bg-secondary/30">
          <Container size="narrow">
            <Reveal>
              <div className="space-y-4">
                <span className="dome-kicker">Questions</span>
                <h2 className="text-display-lg dome-bracket">
                  Frequently asked
                </h2>
              </div>
            </Reveal>

            <div className="dome-timeline">
              <Reveal delay={0.1}>
                <FAQItem 
                  question="What happens after I pay for a chat?"
                  answer="You'll gain immediate access to message the architect directly. They typically respond within 24 hours, and you can exchange unlimited messages for 7 days."
                />
              </Reveal>
              <Reveal delay={0.2}>
                <FAQItem 
                  question="Can I get a refund if the architect doesn't respond?"
                  answer="Yes. If an architect doesn't respond within 48 hours, we'll refund your payment in full, no questions asked."
                />
              </Reveal>
              <Reveal delay={0.3}>
                <FAQItem 
                  question="How are architects verified?"
                  answer="All architects on DomeLink undergo a thorough vetting process including portfolio review, credential verification, and client references."
                />
              </Reveal>
              <Reveal delay={0.4}>
                <FAQItem 
                  question="What if I want to work with the architect long-term?"
                  answer="Great! The chat is your starting point. Once you're ready to proceed, you'll work directly with the architect on project terms and contracts."
                />
              </Reveal>
            </div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

const PricingFeature = ({ children, light = false }: { children: React.ReactNode; light?: boolean }) => (
  <li className="flex items-center gap-3">
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5"
      className={light ? "text-background/60" : "text-muted-foreground"}
    >
      <path d="M3 8l4 4 6-8" />
    </svg>
    <span className={`text-body-sm ${light ? "text-background/80" : "text-muted-foreground"}`}>
      {children}
    </span>
  </li>
);

const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
  <div className="dome-timeline-item">
    <h3 className="text-display-sm mb-4">{question}</h3>
    <p className="text-body text-muted-foreground">{answer}</p>
  </div>
);

export default Pricing;

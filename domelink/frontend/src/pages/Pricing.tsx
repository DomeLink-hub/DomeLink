import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeTimeline from "@/components/layout/DomeTimeline";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useAuth } from "@/context/useAuthContext";
import {
  STANDARD_PLANS,
  PREMIUM_PLANS,
  formatPlanInr,
  type PricingPlan,
} from "@/lib/pricingPlans";

function PlanCard({ plan, ctaHref }: { plan: PricingPlan; ctaHref: string }) {
  return (
    <Reveal>
      <div className="dome-card p-6 md:p-8 h-full flex flex-col">
        <div className="flex-1">
          <p className="text-caption text-muted-foreground mb-1">{plan.subtitle}</p>
          <h3 className="text-display-sm mb-4">{plan.name}</h3>
          <p className="text-display-lg text-primary mb-2">{formatPlanInr(plan.priceInr)}</p>
          <p className="text-body-sm text-muted-foreground mb-6">
            Max {plan.maxSqFt.toLocaleString("en-IN")} sq ft · +{formatPlanInr(plan.perFloorInr)} per additional floor
          </p>

          <Accordion type="single" collapsible>
            <AccordionItem value="breakdown" className="border-border/50">
              <AccordionTrigger className="text-caption text-muted-foreground py-3 hover:no-underline">
                View fee breakdown
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-body-sm text-muted-foreground pb-2">
                  <li className="flex justify-between gap-4">
                    <span>Architect fee</span>
                    <span className="text-foreground">{formatPlanInr(plan.breakdown.architect)}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Platform fee</span>
                    <span className="text-foreground">{formatPlanInr(plan.breakdown.platform)}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Marketing</span>
                    <span className="text-foreground">{formatPlanInr(plan.breakdown.marketing)}</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Support</span>
                    <span className="text-foreground">{formatPlanInr(plan.breakdown.support)}</span>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <Link to={ctaHref} className="mt-6 block">
          <motion.button
            className="dome-button w-full"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Get Started
          </motion.button>
        </Link>
      </div>
    </Reveal>
  );
}

const Pricing = () => {
  const { user } = useAuth();
  const isHomeowner = user?.role === "CLIENT" || user?.role === "homeowner";
  const ctaHref = user && isHomeowner ? "/explore" : "/signup?role=homeowner";

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Pricing"
          title="Consultation packages for every home"
          subtitle="Transparent Indian-market pricing from starter plots to ultra-luxury estates. Pay once to unlock your architect consultation on DomeLink."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container>
            <Reveal>
              <div className="dome-panel p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl">
                  <p className="text-caption text-muted-foreground mb-2">Avora Intelligence</p>
                  <h2 className="text-display-md dome-bracket">Project estimates before you book</h2>
                  <p className="text-body text-muted-foreground mt-4">
                    Run Avora for construction feasibility, then pick a consultation package below to connect with a verified architect.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  {isHomeowner ? (
                    <Link to="/homeowner/avora-estimate">
                      <motion.button
                        className="dome-button px-8 py-4 text-base"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Start Avora Estimate
                      </motion.button>
                    </Link>
                  ) : (
                    <Link to="/signup?role=homeowner">
                      <motion.button
                        className="dome-button px-8 py-4 text-base"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Sign up to estimate
                      </motion.button>
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <Reveal>
              <div className="mb-10">
                <span className="dome-kicker">Group 1</span>
                <h2 className="text-display-lg dome-bracket mt-4">Standard — accessible design access</h2>
                <p className="text-body text-muted-foreground mt-4 max-w-2xl">
                  Built for emerging homeowners and middle-income families starting their architectural journey.
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {STANDARD_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} ctaHref={ctaHref} />
              ))}
            </div>
          </Container>
        </Section>

        <Section padding="small">
          <Container>
            <Reveal>
              <div className="mb-10">
                <span className="dome-kicker">Group 2</span>
                <h2 className="text-display-lg dome-bracket mt-4">Premium class — estate & signature homes</h2>
                <p className="text-body text-muted-foreground mt-4 max-w-2xl">
                  White-glove consultation tiers for large plots, luxury specifications, and developer-grade commissions.
                </p>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PREMIUM_PLANS.map((plan) => (
                <PlanCard key={plan.id} plan={plan} ctaHref={ctaHref} />
              ))}
            </div>
            <Reveal delay={0.2}>
              <p className="text-body-sm text-muted-foreground mt-8 text-center">
                All prices in INR. Additional floor charges apply beyond the max area. Payments processed securely via Razorpay.
              </p>
            </Reveal>
          </Container>
        </Section>

        <Section padding="small">
          <Container size="narrow">
            <Reveal>
              <div className="space-y-4 mb-10">
                <span className="dome-kicker">How it works</span>
                <h2 className="text-display-lg dome-bracket">From package to architect chat</h2>
              </div>
            </Reveal>
            <DomeTimeline
              items={[
                {
                  meta: "01",
                  title: "Choose your package",
                  description: "Select a tier that matches your plot size and budget on this page or when booking an architect.",
                },
                {
                  meta: "02",
                  title: "Book & pay via Razorpay",
                  description: "Complete a short consultation brief, then pay in test mode using your Razorpay checkout.",
                },
                {
                  meta: "03",
                  title: "Meet your architect",
                  description: "Your consultation is confirmed instantly and appears under Payments in your dashboard.",
                },
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

export default Pricing;

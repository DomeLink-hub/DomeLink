import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";

const AboutDomeLink = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Our Story"
          title="About DomeLink"
          subtitle="We connect your nearby architect to you. Our platform bridges the gap between clients and verified architects, making professional architectural services accessible to everyone, everywhere."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container>
            <div className="dome-flow">
              <div className="dome-flow-items grid-cols-1 lg:grid-cols-2">
              <Reveal>
                <div>
                  <h2 className="text-display-sm mb-4">Our Mission</h2>
                  <p className="text-body text-muted-foreground mb-6">
                    DomeLink revolutionizes how people find and connect with professional architects. We believe quality architectural services should be accessible to everyone, from metropolitan cities to rural areas across the globe.
                  </p>
                  <ul className="space-y-3 text-body-sm text-muted-foreground">
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-primary" />Government-verified architect listings</li>
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-primary" />Comprehensive location coverage</li>
                    <li className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-primary" />Transparent budget matching</li>
                  </ul>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div>
                  <span className="text-caption text-muted-foreground block mb-2">Founder</span>
                  <h3 className="text-display-sm text-primary">Kushan Gupta</h3>
                  <p className="text-body-sm text-muted-foreground mb-6">Founder &amp; CEO</p>
                  <span className="text-caption text-muted-foreground block mb-2">Get in Touch</span>
                  <p className="text-body-sm text-muted-foreground">Email: guptakushan007@gmail.com</p>
                  <p className="text-body-sm text-muted-foreground">Phone: +91 7380985392</p>
                </div>
              </Reveal>
              </div>
            </div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default AboutDomeLink;

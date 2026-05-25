import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeFlow from "@/components/layout/DomeFlow";

const HowItWorks = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Steps Away"
          title="How DomeLink Works"
          subtitle="DomeLink connects you with verified architects in different areas by selecting your location, specialty, and budget. We provide you with a curated list of architects near you who match your specific project requirements."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container>
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
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default HowItWorks;

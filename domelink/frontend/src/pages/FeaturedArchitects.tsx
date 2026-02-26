import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeOrbit from "@/components/layout/DomeOrbit";

const FeaturedArchitects = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Featured"
          title="Featured Verified Architects"
          subtitle="Connect with our top-rated, verified professionals from around the world."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container>
            <DomeOrbit
              centerTitle="Atelier North"
              centerSubtitle="Luxury Residential"
              nodes={[
                { label: "Studio Horizon", position: { top: "8%", left: "18%" } },
                { label: "Canyon House", position: { top: "12%", left: "68%" } },
                { label: "Harbor Loft", position: { top: "42%", left: "82%" } },
                { label: "Skyline Family", position: { top: "76%", left: "66%" } },
                { label: "Penthouse Grove", position: { top: "80%", left: "22%" } },
                { label: "Terrace Court", position: { top: "42%", left: "5%" } },
              ]}
            />
            <div className="mt-10 text-center">
              <Link to="/find-architects">
                <motion.button
                  className="dome-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View All Architects
                </motion.button>
              </Link>
            </div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default FeaturedArchitects;

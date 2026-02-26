import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import Reveal from "@/components/animations/Reveal";
import PageTransition from "@/components/layout/PageTransition";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import DomeOrbit from "@/components/layout/DomeOrbit";

const authorities = [
  "Council of Architecture India (COA)",
  "National Council of Architectural Registration Boards (NCARB)",
  "Architects Registration Board (ARB)",
  "Canadian Architectural Licensing Authorities (CALA)",
  "Architects Accreditation Council of Australia (AACA)",
  "Local State Licensing Boards",
];

const VerifiedArchitects = () => {
  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Verified Network"
          title="Government-Verified Architects"
          subtitle="Every architect on DomeLink is verified through official government licensing authorities including:"
          imageUrl="https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1920&q=80"
          align="center"
          className="pt-20"
        />

        <Section padding="small">
          <Container size="narrow">
            <Reveal>
              <DomeOrbit
                centerTitle="Verified"
                centerSubtitle="Government licensing"
                nodes={authorities.map((item, index) => ({
                  label: item,
                  position:
                    index === 0
                      ? { top: "5%", left: "10%" }
                      : index === 1
                      ? { top: "10%", left: "62%" }
                      : index === 2
                      ? { top: "40%", left: "80%" }
                      : index === 3
                      ? { top: "78%", left: "60%" }
                      : index === 4
                      ? { top: "80%", left: "16%" }
                      : { top: "42%", left: "0%" },
                }))}
              />
            </Reveal>

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
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default VerifiedArchitects;

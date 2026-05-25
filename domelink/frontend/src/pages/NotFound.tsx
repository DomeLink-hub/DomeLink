import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    // Structured 404 log
    console.warn(JSON.stringify({
      level: "warn",
      ts: new Date().toISOString(),
      domain: "routing",
      message: "404 — route not found",
      path: location.pathname,
    }));
  }, [location.pathname]);

  return (
    <PageTransition>
      <Header />
      <main>
        <Section padding="default" className="pt-32">
          <Container>
            <div className="max-w-2xl mx-auto text-center">
              {/* Animated architectural rings */}
              <div className="w-24 h-24 mx-auto mb-10 relative">
                <motion.div className="absolute inset-0 rounded-full border border-border/30"
                  animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} />
                <motion.div className="absolute inset-4 rounded-full border border-border/20"
                  animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="dome-node" />
                </div>
              </div>

              <span className="dome-kicker mb-6">Lost in Transit</span>
              <h1 className="text-display-lg dome-bracket mb-6">404</h1>
              <p className="text-body text-muted-foreground mb-10 max-w-md mx-auto">
                The page you are looking for does not exist or has been moved. Let us guide you back.
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Link to="/">
                  <motion.button className="dome-button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Return to Home
                  </motion.button>
                </Link>
                <Link to="/explore">
                  <motion.button className="dome-button-outline" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    Explore Architects
                  </motion.button>
                </Link>
              </div>

              <p className="text-caption text-muted-foreground mt-10 opacity-50">
                {location.pathname}
              </p>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default NotFound;

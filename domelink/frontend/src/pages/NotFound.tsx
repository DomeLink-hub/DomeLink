import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <Header />
      <main>
        <Section padding="default" className="pt-32">
          <Container>
            <div className="dome-panel p-12 text-center max-w-2xl mx-auto">
              <span className="dome-kicker">Lost in Transit</span>
              <h1 className="text-display-lg dome-bracket mb-6">404</h1>
              <p className="text-body text-muted-foreground mb-8">
                The page you are looking for does not exist. Let us guide you back to DomeLink.
              </p>
              <Link to="/" className="dome-button">
                Return to Home
              </Link>
            </div>
          </Container>
        </Section>
      </main>
      <Footer />
    </PageTransition>
  );
};

export default NotFound;

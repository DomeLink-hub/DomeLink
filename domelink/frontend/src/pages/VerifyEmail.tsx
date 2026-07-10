import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { Container, Section } from "@/components/layout/Layout";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Mirrors the same routeForUser logic used in Login.tsx
const routeForUser = (user: { role: string; onboardingCompleted?: boolean }) => {
  const isClient = user.role === "CLIENT" || user.role === "homeowner";
  if (isClient && user.onboardingCompleted === false) return "/homeowner/onboarding";
  if (user.role === "ARCHITECT" || user.role === "architect") {
    return user.onboardingCompleted === false ? "/architect/onboarding" : "/architect/dashboard";
  }
  if (user.role === "ADMIN" || user.role === "admin" || user.role === "SUPERADMIN") return "/admin/dashboard";
  return "/homeowner/dashboard";
};

type VerifyState = "loading" | "success" | "error" | "no-token";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user } = useAuth();

  const [state, setState] = useState<VerifyState>(token ? "loading" : "no-token");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setState("no-token");
      return;
    }

    let cancelled = false;
    api.verifyEmail(token)
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg =
          (err as any)?.message ||
          (err instanceof Error ? err.message : null) ||
          "Verification failed. The link may have expired.";
        setErrorMessage(msg);
        setState("error");
      });

    return () => { cancelled = true; };
  }, [token]);

  const dashboardHref = user ? routeForUser(user) : "/login";

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Email Verification"
          title="Verifying your email"
          subtitle="Please wait while we confirm your email address."
          imageUrl="https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1920&q=80"
          align="center"
          className="pt-20"
        />
        <Section padding="small">
          <Container size="narrow">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="dome-flow pt-6"
            >
              {/* Loading */}
              {state === "loading" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="dome-card p-8 text-center space-y-4"
                >
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-foreground" />
                  </div>
                  <p className="text-body text-muted-foreground">Verifying your email…</p>
                </motion.div>
              )}

              {/* Success */}
              {state === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-6"
                >
                  <div className="dome-card p-8 space-y-4">
                    <p className="text-caption text-muted-foreground uppercase tracking-widest">Confirmed</p>
                    <h2 className="text-display-sm">Email verified</h2>
                    <p className="text-body text-muted-foreground">
                      Your email address has been successfully verified.
                    </p>
                    <Link
                      to={dashboardHref}
                      className="dome-button inline-flex justify-center px-6 py-3"
                    >
                      {user ? "Go to Dashboard" : "Sign In"}
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* Error — expired or invalid token */}
              {state === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-6"
                >
                  <div className="dome-card p-8 space-y-4">
                    <p className="text-caption text-muted-foreground uppercase tracking-widest">Failed</p>
                    <h2 className="text-display-sm">Verification failed</h2>
                    <p className="text-body text-muted-foreground">
                      {errorMessage || "This verification link is invalid or has expired."}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {user
                        ? "You can request a new verification link from your account."
                        : "Please sign in to request a new verification link."}
                    </p>
                    <Link
                      to={user ? "/profile/settings" : "/login"}
                      className="dome-button inline-flex justify-center px-6 py-3"
                    >
                      {user ? "Go to Settings" : "Sign In"}
                    </Link>
                  </div>
                </motion.div>
              )}

              {/* No token in URL */}
              {state === "no-token" && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-6"
                >
                  <div className="dome-card p-8 space-y-4">
                    <p className="text-caption text-muted-foreground uppercase tracking-widest">Invalid Link</p>
                    <h2 className="text-display-sm">Missing verification token</h2>
                    <p className="text-body text-muted-foreground">
                      This verification link is incomplete. Please use the full link from your email.
                    </p>
                    <Link
                      to={user ? "/profile/settings" : "/login"}
                      className="dome-button inline-flex justify-center px-6 py-3"
                    >
                      {user ? "Go to Settings" : "Sign In"}
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </Container>
        </Section>
        <DomeCTA />
      </main>
      <Footer />
    </PageTransition>
  );
};

export default VerifyEmail;

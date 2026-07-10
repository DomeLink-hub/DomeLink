import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { Container, Section } from "@/components/layout/Layout";
import { api } from "@/lib/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await api.forgotPassword(email);
      // Always show success — backend never reveals whether email exists
      setSubmitted(true);
    } catch (err: unknown) {
      const msg =
        (err as any)?.message ||
        (err instanceof Error ? err.message : null) ||
        "Something went wrong. Please try again.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Account Recovery"
          title="Reset your password"
          subtitle="Enter your email address and we'll send you a link to reset your password."
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
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-6"
                >
                  <div className="dome-card p-8 space-y-4">
                    <p className="text-caption text-muted-foreground uppercase tracking-widest">Email sent</p>
                    <h2 className="text-display-sm">Check your inbox</h2>
                    <p className="text-body text-muted-foreground">
                      If an account exists with this email, we've sent a reset link. It expires in 1 hour.
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      Didn't receive it? Check your spam folder, or{" "}
                      <button
                        type="button"
                        onClick={() => { setSubmitted(false); setEmail(""); }}
                        className="text-foreground link-underline"
                      >
                        try again
                      </button>
                      .
                    </p>
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    <Link to="/login" className="text-foreground link-underline">
                      Back to sign in
                    </Link>
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="dome-input"
                      placeholder="you@example.com"
                    />
                  </div>

                  {formError && (
                    <div className="text-red-500 text-sm text-center mb-2">{formError}</div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full dome-button justify-center disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                  </motion.button>

                  <p className="text-body-sm text-muted-foreground text-center">
                    Remember your password?{" "}
                    <Link to="/login" className="text-foreground link-underline">
                      Sign in
                    </Link>
                  </p>
                </form>
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

export default ForgotPassword;

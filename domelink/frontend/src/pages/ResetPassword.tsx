import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { Container, Section } from "@/components/layout/Layout";
import { api } from "@/lib/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Redirect to login after success
  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => navigate("/login", { replace: true }), 2500);
    return () => window.clearTimeout(t);
  }, [success, navigate]);

  // No token in URL — show clear error state, no form
  if (!token) {
    return (
      <PageTransition>
        <Header />
        <main>
          <DomeHero
            kicker="Invalid Link"
            title="Reset link missing"
            subtitle="This password reset link is invalid or incomplete."
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
                className="dome-flow pt-6 text-center space-y-6"
              >
                <div className="dome-card p-8 space-y-4">
                  <p className="text-body text-muted-foreground">
                    The reset link is missing or has been truncated. Please request a new one.
                  </p>
                  <Link
                    to="/forgot-password"
                    className="dome-button inline-flex justify-center px-6 py-3"
                  >
                    Request New Reset Link
                  </Link>
                </div>
                <p className="text-body-sm text-muted-foreground">
                  <Link to="/login" className="text-foreground link-underline">
                    Back to sign in
                  </Link>
                </p>
              </motion.div>
            </Container>
          </Section>
          <DomeCTA />
        </main>
        <Footer />
      </PageTransition>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.resetPassword(token, newPassword);
      setSuccess(true);
    } catch (err: unknown) {
      const msg =
        (err as any)?.message ||
        (err instanceof Error ? err.message : null) ||
        "Unable to reset password.";
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
          title="Set a new password"
          subtitle="Choose a new password for your DomeLink account."
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
              {success ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center space-y-6"
                >
                  <div className="dome-card p-8 space-y-4">
                    <p className="text-caption text-muted-foreground uppercase tracking-widest">Success</p>
                    <h2 className="text-display-sm">Password updated</h2>
                    <p className="text-body text-muted-foreground">
                      Your password has been reset. Redirecting you to sign in…
                    </p>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="dome-input"
                      placeholder="••••••••"
                    />
                  </div>

                  <div>
                    <label className="text-caption text-muted-foreground block mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="dome-input"
                      placeholder="••••••••"
                    />
                  </div>

                  {formError && (
                    <div className="space-y-2">
                      <div className="text-red-500 text-sm text-center">{formError}</div>
                      {/* If token is bad/expired, offer a way back to forgot-password */}
                      {(formError.toLowerCase().includes("invalid") || formError.toLowerCase().includes("expired")) && (
                        <p className="text-body-sm text-muted-foreground text-center">
                          <Link to="/forgot-password" className="text-foreground link-underline">
                            Request a new reset link
                          </Link>
                        </p>
                      )}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full dome-button justify-center disabled:opacity-50"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {isSubmitting ? "Updating..." : "Reset Password"}
                  </motion.button>

                  <p className="text-body-sm text-muted-foreground text-center">
                    <Link to="/login" className="text-foreground link-underline">
                      Back to sign in
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

export default ResetPassword;

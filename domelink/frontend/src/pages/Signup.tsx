import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageTransition from "@/components/layout/PageTransition";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import DomeHero from "@/components/layout/DomeHero";
import DomeCTA from "@/components/layout/DomeCTA";
import { Container, Section } from "@/components/layout/Layout";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const roleHome = (role: "homeowner" | "architect") => (role === "architect" ? "/architect/dashboard" : "/homeowner/dashboard");

const routeForUser = (user: { role: string; onboardingCompleted?: boolean }) => {
  const isClient = user.role === "CLIENT" || user.role === "homeowner";
  if (isClient && user.onboardingCompleted === false) return "/homeowner/onboarding";
  if (user.role === "ARCHITECT" || user.role === "architect") return "/architect/dashboard";
  return "/homeowner/dashboard";
};

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, loading } = useAuth();
  const roleParam = new URLSearchParams(location.search).get("role");
  const defaultRole: "homeowner" | "architect" = roleParam === "architect" ? "architect" : "homeowner";
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    password: "",
    role: defaultRole
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      const user = await signup(formData.role, formData.name, formData.email, formData.password);
      toast.success("Account created successfully!");
      navigate(routeForUser(user) || roleHome(formData.role));
    } catch (err: unknown) {
      const msg =
        (err as any)?.message ||
        (err instanceof Error ? err.message : null) ||
        "Unable to create account.";
      // 409 = email already exists — give a clear message
      if ((err as any)?.status === 409) {
        setFormError("An account with this email already exists. Try signing in instead.");
      } else {
        setFormError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Join DomeLink"
          title="Create your account"
          subtitle="Build a refined profile and connect with verified architects across the globe."
          imageUrl="https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1920&q=80"
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "homeowner" })}
                    className={`flex-1 ${
                      formData.role === "homeowner"
                        ? "dome-button justify-center"
                        : "dome-button-outline justify-center"
                    }`}
                  >
                    Homeowner
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: "architect" })}
                    className={`flex-1 ${
                      formData.role === "architect"
                        ? "dome-button justify-center"
                        : "dome-button-outline justify-center"
                    }`}
                  >
                    Architect
                  </button>
                </div>

                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="dome-input"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="dome-input"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label className="text-caption text-muted-foreground block mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="dome-input"
                    placeholder="••••••••"
                  />
                </div>

                {formError && (
                  <div className="text-red-500 text-sm text-center mb-2">{formError}</div>
                )}
                <motion.button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full dome-button justify-center disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {(isSubmitting || loading) ? "Creating account..." : "Create Account"}
                </motion.button>
              </form>

              <p className="text-body-sm text-muted-foreground text-center mt-8">
                Already have an account?{" "}
                <Link to={`/login?role=${formData.role}`} className="text-foreground link-underline">
                  Sign in
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
};

export default Signup;

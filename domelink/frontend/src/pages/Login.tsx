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
import { useAuth } from "@/context/AuthContext";

const roleHome = (role: "homeowner" | "architect" | "admin") => {
  if (role === "architect") return "/architect/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/homeowner/dashboard";
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading, user } = useAuth();
  const roleParam = new URLSearchParams(location.search).get("role");
  const role: "homeowner" | "architect" = roleParam === "architect" ? "architect" : "homeowner";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    try {
      await login(role, formData.email, formData.password);
      toast.success("Welcome back!");
      const from = new URLSearchParams(location.search).get("from");
      navigate(from || roleHome(role));
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <Header />
      <main>
        <DomeHero
          kicker="Welcome Back"
          title="Sign in to DomeLink"
          subtitle="Access your saved architects, active projects, and private consultations."
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  {(isSubmitting || loading) ? "Signing in..." : "Sign In"}
                </motion.button>
              </form>

              <p className="text-body-sm text-muted-foreground text-center mt-8">
                Don't have an account?{" "}
                <Link to={`/signup?role=${role}`} className="text-foreground link-underline">
                  Sign up
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

export default Login;

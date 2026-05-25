import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";
import ProjectBrief3D from "@/components/3d/ProjectBrief3D";

type StepKey =
  | "projectName" | "projectType" | "plotSize" | "budget"
  | "location" | "stylePreferences" | "timeline" | "requirements" | "inspirationImages";

type Step = { label: string; key: StepKey; eyebrow: string; options?: string[] };

const steps: Step[] = [
  { label: "Name your project",   key: "projectName",       eyebrow: "01 — Identity" },
  { label: "Project type",        key: "projectType",       eyebrow: "02 — Category", options: ["residential", "commercial", "interior", "landscape"] },
  { label: "Plot size",           key: "plotSize",          eyebrow: "03 — Scale" },
  { label: "Budget",              key: "budget",            eyebrow: "04 — Investment" },
  { label: "Location",            key: "location",          eyebrow: "05 — Site" },
  { label: "Style preferences",   key: "stylePreferences",  eyebrow: "06 — Aesthetic" },
  { label: "Timeline",            key: "timeline",          eyebrow: "07 — Schedule" },
  { label: "Requirements",        key: "requirements",      eyebrow: "08 — Brief" },
  { label: "Inspiration images",  key: "inspirationImages", eyebrow: "09 — Vision" },
];

type ProjectBriefForm = {
  projectName: string;
  projectType: "residential" | "commercial" | "interior" | "landscape" | "";
  plotSize: string;
  budget: string;
  location: string;
  stylePreferences: string[];
  timeline: string;
  requirements: string;
  inspirationImages: string[];
  status?: "draft" | "submitted" | "in_progress" | "completed";
};

const heroMotion = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -16 },
};

export default function ProjectBriefWizard() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProjectBriefForm>({
    projectName: "", projectType: "", plotSize: "", budget: "",
    location: "", stylePreferences: [], timeline: "", requirements: "", inspirationImages: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = <K extends keyof ProjectBriefForm>(key: K, value: ProjectBriefForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleNext = () => {
    setError("");
    if (step < steps.length - 1) setStep(step + 1);
    else void handleSubmit();
  };

  const handleBack = () => { setError(""); if (step > 0) setStep(step - 1); };

  const handleSubmit = async () => {
    setLoading(true); setError("");
    try {
      if (!form.projectName || !form.projectType || !form.plotSize || !form.budget || !form.location || !form.timeline || !form.requirements) {
        setError("Please complete all required fields.");
        setLoading(false); return;
      }
      await api.createProjectBrief({ ...form, status: "submitted" });
      navigate("/homeowner/dashboard?brief=done");
    } catch {
      setError("Failed to submit project brief. Please try again.");
    } finally { setLoading(false); }
  };

  const current = steps[step];
  const isFinal = step === steps.length - 1;

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1494526585095-c41746248156?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/35" />
        </div>

        <Header variant="minimal" />

        <div className="relative z-10 min-h-screen flex items-center">
          <Section padding="default" className="w-full pt-28 pb-16">
            <Container size="wide">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 xl:gap-16 items-start">

                {/* Left */}
                <div className="space-y-8">
                  <div className="space-y-4 max-w-2xl">
                    <motion.p
                      className="text-caption tracking-[0.35em] uppercase text-white/60"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {current.eyebrow}
                    </motion.p>
                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={current.label}
                        variants={heroMotion} initial="hidden" animate="visible" exit="exit"
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="text-display-lg text-white dome-bracket"
                      >
                        {current.label}
                      </motion.h1>
                    </AnimatePresence>
                    <p className="text-body text-white/70 max-w-md">
                      Build a detailed project brief that helps architects understand your vision before the first conversation.
                    </p>
                  </div>

                  {isFinal && (
                    <div className="dome-panel p-4">
                      <p className="text-caption text-muted-foreground mb-3">3D Plot Preview</p>
                      <ProjectBrief3D plotSize={form.plotSize} style={form.stylePreferences[0] || "modern"} />
                      <p className="text-body-sm text-muted-foreground mt-3">Rotate to explore massing and spatial intent.</p>
                    </div>
                  )}

                  <div className="flex gap-1.5 flex-wrap">
                    {steps.map((s, i) => (
                      <div
                        key={s.key}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          i === step ? "w-8 bg-white" : i < step ? "w-4 bg-white/50" : "w-4 bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-white/40">Step {step + 1} of {steps.length}</p>
                </div>

                {/* Right: form card */}
                <div className="lg:sticky lg:top-8">
                  <motion.div
                    className="dome-panel p-6 sm:p-8"
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={current.key}
                        variants={heroMotion} initial="hidden" animate="visible" exit="exit"
                        transition={{ duration: 0.4 }}
                        className="space-y-5"
                      >
                        <div className="space-y-1">
                          <p className="text-caption text-muted-foreground">{current.eyebrow}</p>
                          <h2 className="text-display-sm">{current.label}</h2>
                        </div>

                        {current.key === "projectName" && (
                          <input type="text" className="dome-input" value={form.projectName}
                            onChange={(e) => handleChange("projectName", e.target.value)}
                            placeholder="e.g. Modern Family Home" />
                        )}

                        {current.key === "projectType" && (
                          <div className="grid grid-cols-2 gap-2">
                            {(current.options ?? []).map((opt) => (
                              <button key={opt} type="button"
                                onClick={() => handleChange("projectType", opt as ProjectBriefForm["projectType"])}
                                className={`rounded-xl border px-4 py-3 text-left text-sm capitalize transition-all ${
                                  form.projectType === opt
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border/60 bg-card/60 text-foreground hover:border-foreground/40"
                                }`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}

                        {current.key === "plotSize" && (
                          <input type="text" className="dome-input" value={form.plotSize}
                            onChange={(e) => handleChange("plotSize", e.target.value)}
                            placeholder="e.g. 2400 sq ft" />
                        )}

                        {current.key === "budget" && (
                          <input type="number" className="dome-input" value={form.budget}
                            onChange={(e) => handleChange("budget", e.target.value)}
                            min={0} placeholder="e.g. 5000000" />
                        )}

                        {current.key === "location" && (
                          <input type="text" className="dome-input" value={form.location}
                            onChange={(e) => handleChange("location", e.target.value)}
                            placeholder="City, State" />
                        )}

                        {current.key === "stylePreferences" && (
                          <input type="text" className="dome-input" value={form.stylePreferences.join(", ")}
                            onChange={(e) => handleChange("stylePreferences", e.target.value.split(",").map((s) => s.trim()))}
                            placeholder="e.g. modern, minimalist, tropical" />
                        )}

                        {current.key === "timeline" && (
                          <input type="text" className="dome-input" value={form.timeline}
                            onChange={(e) => handleChange("timeline", e.target.value)}
                            placeholder="e.g. 6 months" />
                        )}

                        {current.key === "requirements" && (
                          <textarea className="dome-input min-h-[120px] resize-none" value={form.requirements}
                            onChange={(e) => handleChange("requirements", e.target.value)}
                            rows={4} placeholder="Describe your requirements, must-haves, and vision…" />
                        )}

                        {current.key === "inspirationImages" && (
                          <textarea className="dome-input min-h-[100px] resize-none" value={form.inspirationImages.join("\n")}
                            onChange={(e) => handleChange("inspirationImages", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
                            rows={4} placeholder="Paste image URLs, one per line" />
                        )}

                        {error && (
                          <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                            {error}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button type="button" onClick={handleBack} disabled={step === 0 || loading}
                        className="dome-button-outline px-5 py-3 disabled:opacity-40">
                        Back
                      </button>
                      <motion.button type="button" onClick={handleNext} disabled={loading}
                        className="dome-button px-6 py-3 disabled:opacity-40"
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        {isFinal ? (loading ? "Submitting…" : "Submit Brief") : "Continue"}
                      </motion.button>
                    </div>
                  </motion.div>
                </div>

              </div>
            </Container>
          </Section>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
}

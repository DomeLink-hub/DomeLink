import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, PerspectiveCamera } from "@react-three/drei";
import type { Group } from "three";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Container, Section } from "@/components/layout/Layout";
import PageTransition from "@/components/layout/PageTransition";
import { api } from "@/lib/api";
import { useAuth } from "@/context/useAuthContext";
import { queryKeys } from "@/lib/queryKeys";

const storageKey = "domelink_homeowner_onboarding_draft";

const allowedCities = [
  "Bangalore", "Mumbai", "Pune", "Hyderabad", "Chennai",
  "Kochi", "Ahmedabad", "Jaipur", "Delhi", "Gurgaon",
];

const allowedProjectTypes = [
  "Villa", "Apartment", "Farmhouse", "Interior Renovation",
  "Commercial Space", "Office", "Cafe", "Retail",
];

const allowedStyles = [
  "Modern Minimal", "Contemporary Indian", "Tropical", "Brutalist",
  "Luxury Villa", "Sustainable", "Courtyard", "Scandinavian", "Japandi",
];

const allowedTimelines = ["Immediately", "3-6 months", "6-12 months", "Planning Stage"];
const projectStages = ["Planning", "Design", "Construction", "Interiors"];

type StepId = "welcome" | "basics" | "budget" | "preferences" | "timeline" | "complete";

const steps: Array<{ id: StepId; label: string; title: string; eyebrow: string }> = [
  { id: "welcome",     label: "01", title: "Let's understand your project vision.",    eyebrow: "Homeowner onboarding" },
  { id: "basics",      label: "02", title: "Tell us where and what you are building.", eyebrow: "Project basics" },
  { id: "budget",      label: "03", title: "Define the scale of your project.",        eyebrow: "Budget and plot" },
  { id: "preferences", label: "04", title: "Shape the design language.",               eyebrow: "Design preferences" },
  { id: "timeline",    label: "05", title: "Set the pace for your journey.",           eyebrow: "Timeline" },
  { id: "complete",    label: "06", title: "Your architecture journey begins now.",    eyebrow: "Completion" },
];

type OnboardingForm = {
  city: string;
  projectType: string;
  projectStage: string;
  plotSize: string;
  budgetMin: string;
  budgetMax: string;
  familySize: string;
  preferredStyles: string[];
  vastuPreference: boolean;
  timeline: string;
};

const defaultForm: OnboardingForm = {
  city: "", projectType: "", projectStage: "",
  plotSize: "", budgetMin: "", budgetMax: "",
  familySize: "", preferredStyles: [], vastuPreference: false, timeline: "",
};

const heroMotion = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -18 },
};

/* ── 3D ambient scene ─────────────────────────────────────────── */
const AmbientStructure = () => {
  const group = useRef<Group | null>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    group.current.rotation.y = clock.elapsedTime * 0.18;
    group.current.rotation.x = Math.sin(clock.elapsedTime * 0.4) * 0.08;
  });
  return (
    <group ref={group}>
      <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.35}>
        <mesh position={[-0.35, 0.12, 0]}>
          <boxGeometry args={[1.8, 0.05, 1.2]} />
          <meshStandardMaterial color="#c8bfb0" wireframe transparent opacity={0.6} />
        </mesh>
      </Float>
      <Float speed={1.5} rotationIntensity={0.35} floatIntensity={0.5}>
        <mesh position={[0.55, 0.28, 0.1]}>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <meshStandardMaterial color="#a09080" wireframe transparent opacity={0.3} />
        </mesh>
      </Float>
      <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh position={[-0.95, -0.18, 0.2]}>
          <sphereGeometry args={[0.18, 24, 24]} />
          <meshStandardMaterial color="#807060" wireframe transparent opacity={0.4} />
        </mesh>
      </Float>
    </group>
  );
};

const Ambient3D = () => (
  <div className="h-[200px] md:h-[260px] w-full rounded-2xl overflow-hidden border border-border/40 bg-card/60 backdrop-blur-sm">
    <Canvas dpr={[1, 1.5]}>
      <color attach="background" args={["transparent"]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={1.0} />
      <PerspectiveCamera makeDefault position={[0, 0, 4.5]} fov={42} />
      <AmbientStructure />
    </Canvas>
  </div>
);

/* ── Shared form primitives ───────────────────────────────────── */
const ChoiceButton = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
      active
        ? "border-foreground bg-foreground text-background"
        : "border-border/60 bg-card/60 text-foreground hover:border-foreground/40 hover:bg-card"
    }`}
  >
    {label}
  </button>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block space-y-2">
    <span className="text-caption text-muted-foreground">{label}</span>
    {children}
  </label>
);

const SelectField = ({
  value, onChange, options, placeholder,
}: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder: string;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="dome-input"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o} value={o}>{o}</option>)}
  </select>
);

const InputField = ({
  value, onChange, type, placeholder, min,
}: {
  value: string; onChange: (v: string) => void; type: string; placeholder: string; min?: number;
}) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    type={type}
    min={min}
    placeholder={placeholder}
    className="dome-input"
  />
);

/* ── Main component ───────────────────────────────────────────── */
export default function HomeownerOnboarding() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refresh } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<OnboardingForm>(defaultForm);

  const activeStep = steps[stepIndex];

  /* restore draft */
  useEffect(() => {
    const draft = window.localStorage.getItem(storageKey);
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft) as { stepIndex?: number; form?: Partial<OnboardingForm> };
      if (typeof parsed.stepIndex === "number")
        setStepIndex(Math.min(Math.max(parsed.stepIndex, 0), steps.length - 1));
      if (parsed.form)
        setForm((c) => ({
          ...c, ...parsed.form,
          preferredStyles: Array.isArray(parsed.form!.preferredStyles) ? parsed.form!.preferredStyles : c.preferredStyles,
        }));
    } catch { window.localStorage.removeItem(storageKey); }
  }, []);

  /* persist draft */
  useEffect(() => {
    if (complete) { window.localStorage.removeItem(storageKey); return; }
    window.localStorage.setItem(storageKey, JSON.stringify({ stepIndex, form }));
  }, [complete, form, stepIndex]);

  /* redirect after complete */
  useEffect(() => {
    if (!complete) return;
    const t = window.setTimeout(() => navigate("/homeowner/dashboard", { replace: true }), 1600);
    return () => window.clearTimeout(t);
  }, [complete, navigate]);

  const canContinue = useMemo(() => {
    if (activeStep.id === "welcome") return true;
    if (activeStep.id === "basics") return !!form.city && !!form.projectType && !!form.projectStage;
    if (activeStep.id === "budget") {
      const ps = Number(form.plotSize), bMin = Number(form.budgetMin),
            bMax = Number(form.budgetMax), fs = Number(form.familySize);
      return Boolean(ps > 0 && bMin >= 0 && bMax >= bMin && fs > 0);
    }
    if (activeStep.id === "preferences") return form.preferredStyles.length > 0;
    if (activeStep.id === "timeline") return !!form.timeline;
    return true;
  }, [activeStep.id, form]);

  const next = () => setStepIndex((c) => Math.min(c + 1, steps.length - 1));
  const back = () => setStepIndex((c) => Math.max(c - 1, 0));

  const toggleStyle = (style: string) =>
    setForm((c) => ({
      ...c,
      preferredStyles: c.preferredStyles.includes(style)
        ? c.preferredStyles.filter((s) => s !== style)
        : [...c.preferredStyles, style],
    }));

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      await api.post("/api/onboarding/homeowner", {
        city: form.city, projectType: form.projectType,
        plotSize: Number(form.plotSize), budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax), preferredStyles: form.preferredStyles,
        vastuPreference: form.vastuPreference, timeline: form.timeline,
        familySize: Number(form.familySize), projectStage: form.projectStage,
      });
      await refresh();
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      setComplete(true);
    } catch (err: any) {
      setError(err?.message || "Something went wrong while saving your onboarding details.");
    } finally { setLoading(false); }
  };

  return (
    <PageTransition>
      {/* Full-bleed hero image behind header — same pattern as other pages */}
      <div className="relative min-h-screen overflow-hidden">
        {/* Background image layer */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80"
            alt=""
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
        </div>

        <Header variant="minimal" />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <Section padding="default" className="w-full pt-28 pb-16">
            <Container size="wide">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-10 xl:gap-16 items-start">

                {/* ── Left: editorial copy + 3D + progress ── */}
                <div className="space-y-8">
                  <div className="space-y-4 max-w-2xl">
                    <motion.div
                      className="text-caption tracking-[0.35em] uppercase text-white/60"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {activeStep.eyebrow}
                    </motion.div>

                    <AnimatePresence mode="wait">
                      <motion.h1
                        key={activeStep.title}
                        variants={heroMotion}
                        initial="hidden" animate="visible" exit="exit"
                        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                        className="text-display-lg text-white dome-bracket"
                      >
                        {activeStep.title}
                      </motion.h1>
                    </AnimatePresence>

                    <p className="text-body text-white/70 max-w-xl">
                      A quiet, measured onboarding for Indian homeowners. We use your answers to tune
                      recommendations, improve matching, and shape a more personal dashboard.
                    </p>
                  </div>

                  <Ambient3D />

                  {/* Step progress */}
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      {steps.map((step) => {
                        const isActive = step.id === activeStep.id;
                        const isPast = steps.findIndex((s) => s.id === activeStep.id) > steps.findIndex((s) => s.id === step.id);
                        return (
                          <div
                            key={step.id}
                            className={`flex-1 rounded-full px-2 py-1.5 text-[10px] tracking-[0.2em] uppercase text-center transition-all ${
                              isActive  ? "bg-white text-foreground" :
                              isPast    ? "bg-white/30 text-white" :
                                          "bg-white/10 text-white/40"
                            }`}
                          >
                            {step.label}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50">
                      <span>Step {stepIndex + 1} of {steps.length}</span>
                      <span>{Math.round(((stepIndex + 1) / steps.length) * 100)}% complete</span>
                    </div>
                    <div className="h-px bg-white/20 overflow-hidden rounded-full">
                      <motion.div
                        className="h-full bg-white/70"
                        initial={false}
                        animate={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Right: form card — uses dome-panel, matches site cards ── */}
                <div className="lg:sticky lg:top-8">
                  <motion.div
                    className="dome-panel p-6 sm:p-8"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <AnimatePresence mode="wait">

                      {activeStep.id === "welcome" && (
                        <motion.div key="welcome" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-6">
                          <div className="space-y-2">
                            <p className="text-caption text-muted-foreground">Private architecture intake</p>
                            <h2 className="text-display-sm">Tell us what you are building.</h2>
                          </div>
                          <p className="text-body text-muted-foreground">
                            In a few calm steps, we will capture the project context that helps DomeLink
                            personalise architect recommendations and future AI guidance.
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="dome-card p-4 text-body-sm text-muted-foreground">Multi-step, resumable, and mobile-friendly.</div>
                            <div className="dome-card p-4 text-body-sm text-muted-foreground">Built for real Indian project planning.</div>
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "basics" && (
                        <motion.div key="basics" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-5">
                          <FieldGroup label="City">
                            <SelectField value={form.city} onChange={(v) => setForm((c) => ({ ...c, city: v }))} placeholder="Select city" options={allowedCities} />
                          </FieldGroup>
                          <FieldGroup label="Project Type">
                            <SelectField value={form.projectType} onChange={(v) => setForm((c) => ({ ...c, projectType: v }))} placeholder="Select project type" options={allowedProjectTypes} />
                          </FieldGroup>
                          <FieldGroup label="Project Stage">
                            <div className="grid grid-cols-2 gap-2">
                              {projectStages.map((s) => (
                                <ChoiceButton key={s} active={form.projectStage === s} onClick={() => setForm((c) => ({ ...c, projectStage: s }))} label={s} />
                              ))}
                            </div>
                          </FieldGroup>
                        </motion.div>
                      )}

                      {activeStep.id === "budget" && (
                        <motion.div key="budget" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-5">
                          <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Plot Size (sq ft)">
                              <InputField type="number" min={100} placeholder="1200" value={form.plotSize} onChange={(v) => setForm((c) => ({ ...c, plotSize: v }))} />
                            </FieldGroup>
                            <FieldGroup label="Family Size">
                              <InputField type="number" min={1} placeholder="4" value={form.familySize} onChange={(v) => setForm((c) => ({ ...c, familySize: v }))} />
                            </FieldGroup>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Budget Min (₹)">
                              <InputField type="number" min={0} placeholder="35,00,000" value={form.budgetMin} onChange={(v) => setForm((c) => ({ ...c, budgetMin: v }))} />
                            </FieldGroup>
                            <FieldGroup label="Budget Max (₹)">
                              <InputField type="number" min={0} placeholder="65,00,000" value={form.budgetMax} onChange={(v) => setForm((c) => ({ ...c, budgetMax: v }))} />
                            </FieldGroup>
                          </div>
                          <div className="dome-card p-4 text-body-sm text-muted-foreground">
                            We will use this range to shape recommendations and surface architects aligned to your project scale.
                          </div>
                        </motion.div>
                      )}

                      {activeStep.id === "preferences" && (
                        <motion.div key="preferences" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-5">
                          <FieldGroup label="Preferred Styles">
                            <div className="grid grid-cols-2 gap-2">
                              {allowedStyles.map((s) => (
                                <ChoiceButton key={s} active={form.preferredStyles.includes(s)} onClick={() => toggleStyle(s)} label={s} />
                              ))}
                            </div>
                          </FieldGroup>
                          <button
                            type="button"
                            onClick={() => setForm((c) => ({ ...c, vastuPreference: !c.vastuPreference }))}
                            className={`w-full rounded-xl border p-4 text-left transition-all ${
                              form.vastuPreference
                                ? "border-foreground bg-foreground text-background"
                                : "border-border/60 bg-card/60 text-foreground hover:border-foreground/40"
                            }`}
                          >
                            <div className="text-caption opacity-70">Vastu Preference</div>
                            <div className="mt-1 text-body-sm">
                              {form.vastuPreference ? "Vastu-aligned design is preferred." : "Vastu consideration is not essential."}
                            </div>
                          </button>
                        </motion.div>
                      )}

                      {activeStep.id === "timeline" && (
                        <motion.div key="timeline" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-5">
                          <FieldGroup label="Expected Timeline">
                            <div className="grid grid-cols-1 gap-2">
                              {allowedTimelines.map((t) => (
                                <ChoiceButton key={t} active={form.timeline === t} onClick={() => setForm((c) => ({ ...c, timeline: t }))} label={t} />
                              ))}
                            </div>
                          </FieldGroup>
                        </motion.div>
                      )}

                      {activeStep.id === "complete" && (
                        <motion.div key="complete" variants={heroMotion} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.45 }} className="space-y-6 text-center">
                          <div className="space-y-2">
                            <p className="text-caption text-muted-foreground">Completion</p>
                            <h2 className="text-display-sm">Your architecture journey begins now.</h2>
                          </div>
                          <p className="text-body text-muted-foreground max-w-sm mx-auto">
                            We are saving your preferences and preparing a more personal dashboard,
                            recommendation set, and AI-assisted experience.
                          </p>
                          {error && (
                            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                              {error}
                            </div>
                          )}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="dome-card p-4 text-body-sm text-muted-foreground">Premium architect matching</div>
                            <div className="dome-card p-4 text-body-sm text-muted-foreground">Future AI personalisation</div>
                          </div>
                        </motion.div>
                      )}

                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={back}
                        disabled={stepIndex === 0 || loading || complete}
                        className="dome-button-outline px-5 py-3 disabled:opacity-40"
                      >
                        Back
                      </button>

                      {activeStep.id !== "complete" ? (
                        <button
                          type="button"
                          onClick={next}
                          disabled={!canContinue}
                          className="dome-button px-6 py-3 disabled:opacity-40"
                        >
                          Continue
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void submit()}
                          disabled={loading || complete}
                          className="dome-button px-6 py-3 disabled:opacity-40"
                        >
                          {loading ? "Saving…" : complete ? "Saved" : "Finish and enter dashboard"}
                        </button>
                      )}
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
